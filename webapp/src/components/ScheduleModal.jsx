import React, { useEffect, useState } from 'react';
import { X, Save, FolderOpen, Cloud, HardDrive, Trash2 } from 'lucide-react';
import { useTimerStore } from '../store/useTimerStore';
import { useUIStore } from '../store/useUIStore';
import { useAuth } from '../context/AuthContext';
import { fetchSchedules, createSchedule, deleteScheduleCloud } from '../lib/cloud';
import { formatTimeToInput } from '../lib/time';

export default function ScheduleModal({ mode, onClose }) {
  const activeRoom = useTimerStore((s) => s.getActiveRoom());
  const savedSchedules = useTimerStore((s) => s.savedSchedules);
  const saveSchedule = useTimerStore((s) => s.saveSchedule);
  const loadSchedule = useTimerStore((s) => s.loadSchedule);
  const deleteSchedule = useTimerStore((s) => s.deleteSchedule);
  const showToast = useUIStore((s) => s.showToast);
  const showConfirm = useUIStore((s) => s.showConfirm);
  const { user, isPremium } = useAuth();

  const [name, setName] = useState('');
  const [cloudSchedules, setCloudSchedules] = useState([]);
  const [loadingCloud, setLoadingCloud] = useState(false);

  useEffect(() => {
    if (mode === 'load' && user) {
      setLoadingCloud(true);
      fetchSchedules(user.id)
        .then(setCloudSchedules)
        .catch(() => showToast('Could not load cloud schedules.', { type: 'error' }))
        .finally(() => setLoadingCloud(false));
    }
  }, [mode, user]);

  const handleSave = async () => {
    if (!name.trim()) return showToast('Please enter a schedule name.', { type: 'error' });
    const schedule = saveSchedule(name.trim());
    if (user && isPremium) {
      try {
        await createSchedule(user.id, schedule);
        showToast(`"${schedule.name}" saved to your cloud library.`);
      } catch {
        showToast(`"${schedule.name}" saved locally (cloud save failed).`, { type: 'warning' });
      }
    } else {
      showToast(`"${schedule.name}" saved on this device.`);
    }
    onClose();
  };

  const handleDeleteLocal = (schedule) => {
    showConfirm({
      title: 'Delete schedule',
      message: `Delete "${schedule.name}"? This can't be undone.`,
      onConfirm: () => {
        deleteSchedule(schedule.id);
        showToast(`Deleted "${schedule.name}".`);
      }
    });
  };

  const handleDeleteCloud = (schedule) => {
    showConfirm({
      title: 'Delete cloud schedule',
      message: `Delete "${schedule.name}" from your account? This can't be undone.`,
      onConfirm: async () => {
        await deleteScheduleCloud(schedule.id);
        setCloudSchedules((prev) => prev.filter((s) => s.id !== schedule.id));
        showToast(`Deleted "${schedule.name}".`);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="card max-h-[85vh] w-full max-w-2xl overflow-y-auto p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            {mode === 'save' ? <Save className="h-5 w-5" /> : <FolderOpen className="h-5 w-5" />}
            {mode === 'save' ? 'Save Schedule' : 'Load Schedule'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {mode === 'save' ? (
          <div>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Save the current {activeRoom.timers.length} timer(s) as a reusable schedule.
              {isPremium ? ' It will sync to your account.' : ' It will be stored on this device only — upgrade to sync across devices.'}
            </p>
            <div className="mb-4">
              <label className="label">Schedule name</label>
              <input
                className="input"
                autoFocus
                placeholder="e.g. Sunday Service, Conference Day 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            <div className="mb-6 max-h-48 space-y-1.5 overflow-y-auto rounded-lg bg-slate-50 p-3 dark:bg-white/5">
              {activeRoom.timers.map((t, i) => (
                <div key={t.id} className="flex justify-between rounded bg-white px-3 py-1.5 text-sm shadow-sm dark:bg-white/5">
                  <span>{i + 1}. {t.title || 'Untitled'}</span>
                  <span className="text-slate-400">{formatTimeToInput(t.duration)}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="btn-primary btn-md flex-1">Save Schedule</button>
              <button onClick={onClose} className="btn-secondary btn-md">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <ScheduleGroup
              icon={<HardDrive className="h-4 w-4" />}
              label="On this device"
              schedules={savedSchedules}
              onLoad={(s) => { loadSchedule(s); onClose(); showToast(`Loaded "${s.name}".`); }}
              onDelete={handleDeleteLocal}
            />
            {user && (
              <ScheduleGroup
                icon={<Cloud className="h-4 w-4" />}
                label="Cloud library"
                schedules={cloudSchedules.map((s) => ({ ...s, timers: s.timers, roomName: s.room_name }))}
                loading={loadingCloud}
                onLoad={(s) => { loadSchedule(s); onClose(); showToast(`Loaded "${s.name}".`); }}
                onDelete={handleDeleteCloud}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ScheduleGroup({ icon, label, schedules, loading, onLoad, onDelete }) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {icon} {label}
      </h3>
      {loading && <p className="text-sm text-slate-400">Loading…</p>}
      {!loading && schedules.length === 0 && <p className="text-sm text-slate-400">Nothing saved here yet.</p>}
      <div className="space-y-2">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="rounded-lg border border-slate-200 p-3 transition-colors hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{schedule.name}</div>
                <div className="text-xs text-slate-400">
                  {schedule.timers.length} timer{schedule.timers.length !== 1 ? 's' : ''}
                  {schedule.createdAt ? ` · ${new Date(schedule.createdAt).toLocaleDateString()}` : schedule.created_at ? ` · ${new Date(schedule.created_at).toLocaleDateString()}` : ''}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onLoad(schedule)} className="btn-primary btn-sm">Load</button>
                <button onClick={() => onDelete(schedule)} className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
