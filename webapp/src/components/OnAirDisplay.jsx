import React from 'react';
import { formatTime, percentUsed } from '../lib/time';

function gradientFor(remaining, duration, warnPct, dangerPct) {
  if (remaining < 0) return 'from-rose-600 to-rose-800';
  const pct = percentUsed(remaining, duration);
  if (pct >= dangerPct) return 'from-rose-600 to-rose-800';
  if (pct >= warnPct) return 'from-amber-500 to-orange-600';
  return 'from-emerald-600 to-emerald-800';
}

export default function OnAirDisplay({ timer, messages, settings }) {
  if (!timer) return null;
  const isOver = timer.remainingTime < 0;
  const gradient = gradientFor(timer.remainingTime, timer.duration, settings.warnThresholdPct, settings.dangerThresholdPct);
  const pct = isOver ? 100 : Math.min(100, percentUsed(timer.remainingTime, timer.duration));

  return (
    <div className={`relative flex-shrink-0 bg-gradient-to-br ${gradient} px-6 py-8 text-center text-white`}>
      {isOver && (
        <div className="mb-4 inline-block animate-flash-bg rounded-xl border-2 border-white bg-rose-700 px-6 py-3 text-lg font-bold shadow-xl sm:text-2xl">
          ⚠️ TIME UP — PLEASE ROUND UP ⚠️
        </div>
      )}
      {messages?.length > 0 && (
        <div className="mb-4 flex flex-col items-center gap-2">
          {messages.map((msg) => (
            <div key={msg.id} className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg sm:text-base">
              📢 {msg.text}
            </div>
          ))}
        </div>
      )}
      <div className={`tabular mb-1 select-none text-6xl font-extrabold sm:text-8xl lg:text-9xl ${isOver ? 'text-amber-200' : ''}`}>
        {formatTime(timer.remainingTime)}
      </div>
      <div className="text-xl opacity-90 sm:text-2xl lg:text-3xl">{timer.title || 'Untitled Timer'}</div>
      {timer.notes && <div className="mt-1 text-base opacity-75 sm:text-lg">{timer.notes}</div>}

      <div className="mx-auto mt-6 max-w-4xl">
        <div className="h-2 overflow-hidden rounded-full bg-black/20">
          <div className="h-full bg-white/60 transition-all duration-150" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
