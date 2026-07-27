import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Clock, Plus, Zap } from 'lucide-react';
import { useTimerStore } from '../store/useTimerStore';
import { useUIStore } from '../store/useUIStore';
import { useAuth } from '../context/AuthContext';
import { playAlertSound, primeAudio } from '../lib/sound';
import { createPresenterPublisher } from '../lib/presenterChannel';
import { remainingFreeTimers, isAtFreeLimit, FREE_TIMER_LIMIT } from '../lib/plan';

import AppHeader from '../components/AppHeader';
import OnAirDisplay from '../components/OnAirDisplay';
import TimerTile from '../components/TimerTile';
import TimerEditModal from '../components/TimerEditModal';
import MessagesPanel from '../components/MessagesPanel';
import ScheduleModal from '../components/ScheduleModal';
import TemplatesModal from '../components/TemplatesModal';
import SettingsModal from '../components/SettingsModal';
import ShortcutsModal from '../components/ShortcutsModal';
import ShareRoomModal from '../components/ShareRoomModal';

const QUICK_PRESETS = [
  { label: '1 min', duration: 60000 },
  { label: '2 min', duration: 120000 },
  { label: '5 min', duration: 300000 },
  { label: '10 min', duration: 600000 },
  { label: '15 min', duration: 900000 }
];
const MORE_PRESETS = [
  { label: '20 min', duration: 1200000 },
  { label: '30 min', duration: 1800000 },
  { label: '45 min', duration: 2700000 },
  { label: '1 hour', duration: 3600000 }
];

export default function Dashboard() {
  const rooms = useTimerStore((s) => s.rooms);
  const activeRoomId = useTimerStore((s) => s.activeRoomId);
  const messages = useTimerStore((s) => s.messages);
  const settings = useTimerStore((s) => s.settings);
  const tick = useTimerStore((s) => s.tick);
  const addTimer = useTimerStore((s) => s.addTimer);
  const updateTimer = useTimerStore((s) => s.updateTimer);
  const toggleTimer = useTimerStore((s) => s.toggleTimer);
  const resetTimer = useTimerStore((s) => s.resetTimer);
  const adjustTime = useTimerStore((s) => s.adjustTime);
  const deleteTimerAction = useTimerStore((s) => s.deleteTimer);
  const restoreTimer = useTimerStore((s) => s.restoreTimer);
  const reorderTimers = useTimerStore((s) => s.reorderTimers);
  const sendMessage = useTimerStore((s) => s.sendMessage);
  const clearMessages = useTimerStore((s) => s.clearMessages);
  const deleteMessage = useTimerStore((s) => s.deleteMessage);
  const toggleMessageVisibility = useTimerStore((s) => s.toggleMessageVisibility);
  const getAlertState = useTimerStore((s) => s.getAlertState);
  const markAlertPlayed = useTimerStore((s) => s.markAlertPlayed);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];
  const { isPremium } = useAuth();
  const showToast = useUIStore((s) => s.showToast);
  const showConfirm = useUIStore((s) => s.showConfirm);
  const openUpgradeModal = useUIStore((s) => s.openUpgradeModal);

  const [modal, setModal] = useState(null); // 'save' | 'load' | 'templates' | 'settings' | 'shortcuts' | 'share'
  const [editingTimer, setEditingTimer] = useState(null);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const intervalRef = useRef(null);
  const publisherRef = useRef(null);
  const lastTickRef = useRef(Date.now());

  const onAirTimer = activeRoom.timers[0];
  // Only messages explicitly left visible reach the on-air display / presenter view.
  const visibleMessages = messages.filter((m) => m.visible !== false).slice(-3).reverse();

  // ── Master ticking loop ─────────────────────────────────────────────
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      tick(delta);
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [tick]);

  // ── Audio alerts for the on-air timer ───────────────────────────────
  useEffect(() => {
    if (!onAirTimer?.isRunning) return;
    const remaining = onAirTimer.remainingTime;
    const alerts = getAlertState(onAirTimer.id);
    if (settings.warningAt60 && remaining <= 60000 && remaining > 59000 && !alerts.warning60) {
      playAlertSound('warning', settings);
      markAlertPlayed(onAirTimer.id, 'warning60');
    }
    if (settings.warningAt30 && remaining <= 30000 && remaining > 29000 && !alerts.warning30) {
      playAlertSound('warning', settings);
      markAlertPlayed(onAirTimer.id, 'warning30');
    }
    if (settings.alarmAtZero && remaining <= 0 && remaining > -1000 && !alerts.alarm) {
      playAlertSound('alarm', settings);
      markAlertPlayed(onAirTimer.id, 'alarm');
    }
  }, [onAirTimer?.remainingTime, onAirTimer?.isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Publish live state to the presenter view ────────────────────────
  useEffect(() => {
    publisherRef.current = createPresenterPublisher(activeRoom.roomCode);
    return () => publisherRef.current?.close();
  }, [activeRoom.roomCode]);

  useEffect(() => {
    publisherRef.current?.publish({ timer: onAirTimer || null, messages: visibleMessages, settings, roomName: activeRoom.name });
  }, [onAirTimer, visibleMessages, settings, activeRoom.name]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard shortcuts ───────────────────────────────────────────────
  const handleAddTimer = useCallback(
    (preset) => {
      if (isAtFreeLimit(rooms, isPremium)) {
        openUpgradeModal();
        return;
      }
      addTimer(preset);
    },
    [rooms, isPremium, addTimer, openUpgradeModal]
  );

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const timers = activeRoom.timers;
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          primeAudio();
          if (timers[0]) toggleTimer(timers[0].id);
          break;
        case 'n':
          e.preventDefault();
          handleAddTimer();
          break;
        case 'r':
          e.preventDefault();
          if (timers[0]) resetTimer(timers[0].id);
          break;
        case 'm':
          e.preventDefault();
          useTimerStore.getState().setSettings({ audioEnabled: !useTimerStore.getState().settings.audioEnabled });
          break;
        case '?':
          e.preventDefault();
          setModal('shortcuts');
          break;
        case 'escape':
          setModal(null);
          setEditingTimer(null);
          break;
        default: {
          const num = parseInt(e.key, 10);
          if (num >= 1 && num <= 9 && num <= timers.length) {
            e.preventDefault();
            toggleTimer(timers[num - 1].id);
          }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeRoom.timers, toggleTimer, resetTimer, handleAddTimer]);

  const handleDelete = (timer) => {
    showConfirm({
      title: 'Delete timer',
      message: `Delete "${timer.title || 'Untitled Timer'}"? You can undo this for a few seconds after.`,
      onConfirm: () => {
        const { removed, index, roomId } = deleteTimerAction(timer.id);
        showToast(`Deleted "${timer.title || 'Untitled Timer'}".`, {
          type: 'success',
          action: { label: 'Undo', onClick: () => restoreTimer(roomId, index, removed) }
        });
      }
    });
  };

  const remaining = remainingFreeTimers(rooms, isPremium);

  return (
    <div className="flex h-screen flex-col bg-surface-light dark:bg-surface-dark">
      <AppHeader
        onOpenSave={() => setModal('save')}
        onOpenLoad={() => setModal('load')}
        onOpenTemplates={() => setModal('templates')}
        onOpenShare={() => setModal('share')}
        onOpenSettings={() => setModal('settings')}
        onOpenShortcuts={() => setModal('shortcuts')}
        onToggleMessages={() => setMessagesOpen((v) => !v)}
        messagesOpen={messagesOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <OnAirDisplay timer={onAirTimer} messages={visibleMessages} settings={settings} />

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Timers</h2>
              <div className="flex flex-wrap items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                {QUICK_PRESETS.map((p) => (
                  <button key={p.label} onClick={() => handleAddTimer(p)} className="btn-secondary btn-sm !px-2 !py-1 text-xs">
                    {p.label}
                  </button>
                ))}
                <div className="relative">
                  <button onClick={() => setMoreOpen((v) => !v)} className="btn-secondary btn-sm !px-2 !py-1 text-xs">More…</button>
                  {moreOpen && (
                    <div className="absolute right-0 top-full z-10 mt-1 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-slate-900" onMouseLeave={() => setMoreOpen(false)}>
                      {MORE_PRESETS.map((p) => (
                        <button key={p.label} onClick={() => { handleAddTimer(p); setMoreOpen(false); }} className="block w-full whitespace-nowrap rounded px-3 py-1.5 text-left text-xs hover:bg-slate-50 dark:hover:bg-white/5">
                          {p.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => handleAddTimer()} className="btn-primary btn-sm">
                  <Plus className="h-3.5 w-3.5" /> Add Timer (N)
                </button>
              </div>
            </div>

            {!isPremium && remaining <= 3 && activeRoom.timers.length > 0 && (
              <button
                onClick={() => openUpgradeModal()}
                className="mb-4 flex w-full items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-left text-sm text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
              >
                <span>{remaining === 0 ? `You've reached the ${FREE_TIMER_LIMIT}-timer free limit.` : `Only ${remaining} free timer${remaining === 1 ? '' : 's'} left.`}</span>
                <span className="font-semibold underline">Upgrade →</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {activeRoom.timers.map((timer, index) => (
                <TimerTile
                  key={timer.id}
                  timer={timer}
                  isOnAir={index === 0}
                  keyHint={index > 0 && index <= 8 ? index + 1 : null}
                  settings={settings}
                  onToggle={(id) => { primeAudio(); toggleTimer(id); }}
                  onReset={resetTimer}
                  onDelete={handleDelete}
                  onEdit={setEditingTimer}
                  dragProps={{
                    draggable: true,
                    onDragStart: () => setDragId(timer.id),
                    onDragOver: (e) => { e.preventDefault(); if (dragId && dragId !== timer.id) setDragOverId(timer.id); },
                    onDragLeave: () => setDragOverId(null),
                    onDrop: (e) => { e.preventDefault(); if (dragId && dragId !== timer.id) reorderTimers(dragId, timer.id); setDragId(null); setDragOverId(null); },
                    onDragEnd: () => { setDragId(null); setDragOverId(null); },
                    'data-dragging': dragId === timer.id,
                    'data-dragover': dragOverId === timer.id
                  }}
                />
              ))}
            </div>

            {activeRoom.timers.length === 0 && (
              <div className="py-16 text-center text-slate-400">
                <Clock className="mx-auto mb-4 h-14 w-14 opacity-40" />
                <p className="mb-4">No timers yet. Click "Add Timer", press N, or start from a template.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[...QUICK_PRESETS, ...MORE_PRESETS].map((p) => (
                    <button key={p.label} onClick={() => handleAddTimer(p)} className="btn-secondary btn-sm">+ {p.label}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {messagesOpen && (
          <MessagesPanel
            messages={messages}
            onSend={sendMessage}
            onToggleVisibility={toggleMessageVisibility}
            onDelete={deleteMessage}
            onClear={() => {
              showConfirm({ title: 'Clear messages', message: 'Remove all presenter messages?', onConfirm: () => { clearMessages(); showToast('Messages cleared.'); } });
            }}
            onClose={() => setMessagesOpen(false)}
          />
        )}
      </div>

      {modal === 'save' && <ScheduleModal mode="save" onClose={() => setModal(null)} />}
      {modal === 'load' && <ScheduleModal mode="load" onClose={() => setModal(null)} />}
      {modal === 'templates' && <TemplatesModal onClose={() => setModal(null)} />}
      {modal === 'settings' && <SettingsModal onClose={() => setModal(null)} />}
      {modal === 'shortcuts' && <ShortcutsModal onClose={() => setModal(null)} />}
      {modal === 'share' && <ShareRoomModal roomCode={activeRoom.roomCode} onClose={() => setModal(null)} />}
      {editingTimer && (
        <TimerEditModal
          timer={activeRoom.timers.find((t) => t.id === editingTimer.id) || editingTimer}
          onUpdate={updateTimer}
          onAdjust={adjustTime}
          onDelete={handleDelete}
          onClose={() => setEditingTimer(null)}
        />
      )}
    </div>
  );
}
