import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { makeId, makeRoomCode } from '../lib/id';
import { formatTimeToInput } from '../lib/time';

const DEFAULT_SETTINGS = {
  audioEnabled: true,
  volume: 0.7,
  soundType: 'gentle',
  warningAt60: true,
  warningAt30: true,
  alarmAtZero: true,
  autoAdvance: false,
  warnThresholdPct: 50,
  dangerThresholdPct: 75
};

function freshAlertState() {
  return { warning60: false, warning30: false, alarm: false };
}

function makeTimer({ title = '', duration = 600000, notes = '' } = {}) {
  return {
    id: makeId(),
    title,
    duration,
    remainingTime: duration,
    isRunning: false,
    notes,
    timeInput: formatTimeToInput(duration)
  };
}

function makeRoom(name) {
  return { id: makeId(), name, roomCode: makeRoomCode(), timers: [] };
}

export const useTimerStore = create(
  persist(
    (set, get) => ({
      rooms: [makeRoom('Session 1')],
      activeRoomId: null, // resolved to rooms[0].id on first read via getActiveRoom()
      messages: [],
      settings: DEFAULT_SETTINGS,
      savedSchedules: [],
      theme: 'dark',
      _alerts: {}, // timerId -> { warning60, warning30, alarm } — not persisted

      getActiveRoom: () => {
        const { rooms, activeRoomId } = get();
        return rooms.find((r) => r.id === activeRoomId) || rooms[0];
      },

      setActiveRoomId: (id) => set({ activeRoomId: id }),

      setTheme: (theme) => set({ theme }),

      // ── Rooms ────────────────────────────────────────────────────────
      addRoom: () => {
        const room = makeRoom(`Session ${get().rooms.length + 1}`);
        set((s) => ({ rooms: [...s.rooms, room], activeRoomId: room.id }));
        return room;
      },
      renameRoom: (roomId, name) =>
        set((s) => ({ rooms: s.rooms.map((r) => (r.id === roomId ? { ...r, name } : r)) })),
      deleteRoom: (roomId) =>
        set((s) => {
          if (s.rooms.length <= 1) return s;
          const rooms = s.rooms.filter((r) => r.id !== roomId);
          const activeRoomId = s.activeRoomId === roomId ? rooms[0].id : s.activeRoomId;
          return { rooms, activeRoomId };
        }),

      // ── Timers ───────────────────────────────────────────────────────
      addTimer: (preset) => {
        const timer = makeTimer(preset ? { title: preset.label, duration: preset.duration } : {});
        const roomId = get().activeRoomId || get().rooms[0].id;
        set((s) => ({
          rooms: s.rooms.map((r) => (r.id === roomId ? { ...r, timers: [...r.timers, timer] } : r)),
          _alerts: { ...s._alerts, [timer.id]: freshAlertState() }
        }));
        return timer;
      },

      addTimersFromTemplate: (templateTimers, roomName) => {
        const roomId = get().activeRoomId || get().rooms[0].id;
        const newTimers = templateTimers.map((t) => makeTimer(t));
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId ? { ...r, name: roomName || r.name, timers: [...r.timers, ...newTimers] } : r
          ),
          _alerts: {
            ...s._alerts,
            ...Object.fromEntries(newTimers.map((t) => [t.id, freshAlertState()]))
          }
        }));
        return newTimers;
      },

      updateTimer: (timerId, updates) => {
        const roomId = get().activeRoomId || get().rooms[0].id;
        if (updates.duration) {
          set((s) => ({ _alerts: { ...s._alerts, [timerId]: freshAlertState() } }));
        }
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId
              ? { ...r, timers: r.timers.map((t) => (t.id === timerId ? { ...t, ...updates } : t)) }
              : r
          )
        }));
      },

      adjustTime: (timerId, deltaMs) => {
        const roomId = get().activeRoomId || get().rooms[0].id;
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId
              ? {
                  ...r,
                  timers: r.timers.map((t) =>
                    t.id === timerId
                      ? {
                          ...t,
                          remainingTime: Math.max(0, t.remainingTime + deltaMs),
                          duration: Math.max(60000, t.duration + deltaMs)
                        }
                      : t
                  )
                }
              : r
          )
        }));
      },

      toggleTimer: (timerId) => {
        const roomId = get().activeRoomId || get().rooms[0].id;
        set((s) => ({
          rooms: s.rooms.map((room) => {
            if (room.id !== roomId) return room;
            const clicked = room.timers.find((t) => t.id === timerId);
            const isStarting = clicked && !clicked.isRunning;
            if (isStarting) {
              s._alerts[timerId] = freshAlertState();
            }
            let timers = room.timers.map((t) => {
              if (t.id === timerId) return { ...t, isRunning: !t.isRunning };
              if (isStarting && t.isRunning) return { ...t, isRunning: false };
              return t;
            });
            if (isStarting) {
              timers = [...timers].sort((a, b) => (a.id === timerId ? -1 : b.id === timerId ? 1 : 0));
            }
            return { ...room, timers };
          })
        }));
      },

      resetTimer: (timerId) => {
        const roomId = get().activeRoomId || get().rooms[0].id;
        set((s) => ({
          _alerts: { ...s._alerts, [timerId]: freshAlertState() },
          rooms: s.rooms.map((r) =>
            r.id === roomId
              ? { ...r, timers: r.timers.map((t) => (t.id === timerId ? { ...t, remainingTime: t.duration, isRunning: false } : t)) }
              : r
          )
        }));
      },

      deleteTimer: (timerId) => {
        const roomId = get().activeRoomId || get().rooms[0].id;
        const room = get().rooms.find((r) => r.id === roomId);
        const index = room.timers.findIndex((t) => t.id === timerId);
        const removed = room.timers[index];
        set((s) => ({
          rooms: s.rooms.map((r) => (r.id === roomId ? { ...r, timers: r.timers.filter((t) => t.id !== timerId) } : r))
        }));
        // Returned so the UI can offer an "Undo" toast.
        return { removed, index, roomId };
      },

      restoreTimer: (roomId, index, timer) => {
        set((s) => ({
          rooms: s.rooms.map((r) => {
            if (r.id !== roomId) return r;
            const timers = [...r.timers];
            timers.splice(Math.min(index, timers.length), 0, timer);
            return { ...r, timers };
          }),
          _alerts: { ...s._alerts, [timer.id]: freshAlertState() }
        }));
      },

      reorderTimers: (draggedId, targetId) => {
        const roomId = get().activeRoomId || get().rooms[0].id;
        set((s) => ({
          rooms: s.rooms.map((room) => {
            if (room.id !== roomId) return room;
            const timers = [...room.timers];
            const from = timers.findIndex((t) => t.id === draggedId);
            const to = timers.findIndex((t) => t.id === targetId);
            if (from === -1 || to === -1) return room;
            const [moved] = timers.splice(from, 1);
            timers.splice(to, 0, moved);
            return { ...room, timers };
          })
        }));
      },

      // ── Ticking (called once/sec-ish from a single root interval) ─────
      tick: (deltaMs) => {
        const { settings } = get();
        set((s) => ({
          rooms: s.rooms.map((room) => {
            let timers = room.timers.map((t) => (t.isRunning ? { ...t, remainingTime: t.remainingTime - deltaMs } : t));

            if (settings.autoAdvance) {
              const runningIndex = timers.findIndex((t) => t.isRunning);
              if (runningIndex !== -1 && timers[runningIndex].remainingTime <= 0) {
                const nextIndex = runningIndex + 1;
                if (timers[nextIndex]) {
                  timers = timers.map((t, i) => {
                    if (i === runningIndex) return { ...t, isRunning: false };
                    if (i === nextIndex) return { ...t, isRunning: true, remainingTime: t.duration };
                    return t;
                  });
                  s._alerts[timers[nextIndex].id] = freshAlertState();
                }
              }
            }
            return { ...room, timers };
          })
        }));
      },

      // ── Messages ────────────────────────────────────────────────────
      sendMessage: (text) => {
        if (!text.trim()) return;
        set((s) => ({ messages: [...s.messages, { id: makeId(), text: text.trim(), timestamp: new Date().toLocaleTimeString(), visible: true }] }));
      },
      clearMessages: () => set({ messages: [] }),
      deleteMessage: (messageId) => set((s) => ({ messages: s.messages.filter((m) => m.id !== messageId) })),
      toggleMessageVisibility: (messageId) =>
        set((s) => ({ messages: s.messages.map((m) => (m.id === messageId ? { ...m, visible: !m.visible } : m)) })),

      // ── Settings ────────────────────────────────────────────────────
      setSettings: (updates) => set((s) => ({ settings: { ...s.settings, ...updates } })),

      // ── Schedules (local library; cloud schedules are handled separately) ─
      saveSchedule: (name) => {
        const room = get().getActiveRoom();
        const schedule = {
          id: makeId(),
          name,
          roomName: room.name,
          timers: room.timers.map((t) => ({ title: t.title, duration: t.duration, notes: t.notes, timeInput: t.timeInput })),
          createdAt: new Date().toISOString()
        };
        set((s) => ({ savedSchedules: [...s.savedSchedules, schedule] }));
        return schedule;
      },
      loadSchedule: (schedule) => {
        const roomId = get().activeRoomId || get().rooms[0].id;
        const timers = schedule.timers.map((t) => makeTimer(t));
        set((s) => ({
          rooms: s.rooms.map((r) => (r.id === roomId ? { ...r, name: schedule.roomName || r.name, timers } : r)),
          _alerts: { ...s._alerts, ...Object.fromEntries(timers.map((t) => [t.id, freshAlertState()])) }
        }));
      },
      deleteSchedule: (scheduleId) => set((s) => ({ savedSchedules: s.savedSchedules.filter((sch) => sch.id !== scheduleId) })),

      // ── Alert bookkeeping (mirrors original desktop app's ref) ─────────
      getAlertState: (timerId) => get()._alerts[timerId] || freshAlertState(),
      markAlertPlayed: (timerId, key) =>
        set((s) => ({ _alerts: { ...s._alerts, [timerId]: { ...(s._alerts[timerId] || freshAlertState()), [key]: true } } }))
    }),
    {
      name: 'mzt-store-v1',
      partialize: (s) => ({
        rooms: s.rooms,
        activeRoomId: s.activeRoomId,
        messages: s.messages,
        settings: s.settings,
        savedSchedules: s.savedSchedules,
        theme: s.theme
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Never resume a countdown that was "running" against a browser tab that's since been closed.
        // Also one-time-migrate any never-renamed "Room N" default names from before the Session rename.
        const renameDefault = (name) => name.replace(/^Room (\d+)$/, 'Session $1');
        state.rooms = state.rooms.map((r) => ({
          ...r,
          name: renameDefault(r.name),
          timers: r.timers.map((t) => ({ ...t, isRunning: false }))
        }));
        state.savedSchedules = state.savedSchedules.map((sch) => ({ ...sch, roomName: sch.roomName ? renameDefault(sch.roomName) : sch.roomName }));
        if (!state.activeRoomId && state.rooms[0]) state.activeRoomId = state.rooms[0].id;
      }
    }
  )
);
