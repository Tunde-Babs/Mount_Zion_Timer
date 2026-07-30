import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Maximize2 } from 'lucide-react';
import { subscribePresenterChannel } from '../lib/presenterChannel';
import { formatTime, percentUsed } from '../lib/time';

function gradientFor(remaining, duration, warnPct = 50, dangerPct = 75) {
  if (remaining < 0) return 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
  const pct = percentUsed(remaining, duration);
  if (pct >= dangerPct) return 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
  if (pct >= warnPct) return 'linear-gradient(135deg, #eab308 0%, #f97316 100%)';
  return 'linear-gradient(135deg, #059669 0%, #047857 100%)';
}

export default function PresenterPage() {
  const { roomCode } = useParams();
  const [syncState, setSyncState] = useState(null); // raw last-received broadcast payload
  const [state, setState] = useState(null); // syncState with timer.remainingTime interpolated to "now"
  const [lastFlash, setLastFlash] = useState(0);
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    document.title = `Presenter · ${roomCode}`;
    const unsubscribe = subscribePresenterChannel(roomCode, setSyncState);
    return unsubscribe;
  }, [roomCode]);

  // The control panel publishes roughly every 100ms while a timer is running,
  // but this tab (or that one) can get backgrounded — mobile browsers and even
  // desktop Chrome aggressively throttle/suspend timers in background tabs, so
  // updates can stop arriving for seconds or minutes. Rather than displaying the
  // last message verbatim (which would show a frozen, stale time), we recompute
  // the countdown locally from real elapsed wall-clock time since that message —
  // so the instant this tab becomes visible again, it shows the correct current
  // time immediately, with no dependency on a fresh broadcast having just arrived.
  useEffect(() => {
    if (!syncState?.timer) {
      setState(syncState);
      return;
    }

    const recompute = () => {
      const elapsed = syncState.timer.isRunning ? Date.now() - syncState.ts : 0;
      setState({ ...syncState, timer: { ...syncState.timer, remainingTime: syncState.timer.remainingTime - elapsed } });
    };

    recompute();
    const interval = setInterval(recompute, 200);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') recompute();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [syncState]);

  const timer = state?.timer;
  const isOver = timer && timer.remainingTime < 0;

  useEffect(() => {
    if (!isOver) return;
    const now = Date.now();
    if (now - lastFlash >= 10000) {
      setFlashing(true);
      setLastFlash(now);
      const t = setTimeout(() => setFlashing(false), 500);
      return () => clearTimeout(t);
    }
  }, [timer?.remainingTime, isOver]); // eslint-disable-line react-hooks/exhaustive-deps

  const enterFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  const bg = timer
    ? gradientFor(timer.remainingTime, timer.duration, state?.settings?.warnThresholdPct, state?.settings?.dangerThresholdPct)
    : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
  const pct = timer ? (isOver ? 100 : Math.min(100, percentUsed(timer.remainingTime, timer.duration))) : 0;

  return (
    <div
      onClick={enterFullscreen}
      className={`relative flex h-screen w-screen select-none flex-col items-center justify-center overflow-hidden text-white transition-[background] duration-500 ${flashing ? 'animate-flash-bg' : ''}`}
      style={{ background: bg, cursor: 'none' }}
    >
      {isOver && (
        <div className="absolute left-1/2 top-[12%] -translate-x-1/2 animate-pulse rounded-2xl border-4 border-white bg-rose-700 px-10 py-6 text-center text-3xl font-extrabold shadow-2xl sm:text-5xl">
          ⚠️ TIME UP<br />PLEASE ROUND UP ⚠️
        </div>
      )}

      {state?.messages?.length > 0 && (
        <div className="absolute top-8 flex w-[90%] flex-col items-center gap-3">
          {state.messages.map((msg) => (
            <div key={msg.id} className="animate-pulse rounded-2xl bg-amber-400 px-8 py-4 text-center text-2xl font-semibold text-slate-900 shadow-2xl sm:text-4xl">
              📢 {msg.text}
            </div>
          ))}
        </div>
      )}

      {timer ? (
        <>
          <div className="tabular text-center text-[20vw] font-extrabold leading-none drop-shadow-2xl sm:text-[22vw]">{formatTime(timer.remainingTime)}</div>
          <div className="mt-4 max-w-[90%] text-center text-4xl opacity-95 drop-shadow-lg sm:text-6xl">{timer.title || 'Timer'}</div>
          {timer.notes && <div className="mt-2 max-w-[80%] text-center text-2xl opacity-85 drop-shadow sm:text-4xl">{timer.notes}</div>}
        </>
      ) : (
        <div className="text-center opacity-70">
          <Clock className="mx-auto mb-4 h-16 w-16" />
          <h2 className="mb-2 text-3xl font-semibold sm:text-4xl">Platform Timer</h2>
          <p className="text-lg sm:text-xl">Waiting for the control panel to send a timer…</p>
          <p className="mt-1 font-mono text-sm opacity-60">Session {roomCode}</p>
          <p className="mt-6 flex items-center justify-center gap-1.5 text-sm opacity-50"><Maximize2 className="h-4 w-4" /> Click anywhere for fullscreen</p>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/30">
        <div className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-150" style={{ width: `${pct}%` }} />
      </div>
      <div className="absolute bottom-8 right-6 text-xs opacity-30">Press Esc to exit fullscreen</div>
    </div>
  );
}
