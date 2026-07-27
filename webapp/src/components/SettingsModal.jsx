import React from 'react';
import { X, Settings as SettingsIcon, Volume2, VolumeX } from 'lucide-react';
import { useTimerStore } from '../store/useTimerStore';
import { playAlertSound } from '../lib/sound';

const SOUND_TYPES = [
  { value: 'gentle', label: 'Gentle' },
  { value: 'chime', label: 'Chime' },
  { value: 'urgent', label: 'Urgent' }
];

export default function SettingsModal({ onClose }) {
  const settings = useTimerStore((s) => s.settings);
  const setSettings = useTimerStore((s) => s.setSettings);

  const previewSound = (kind) => playAlertSound(kind, settings);

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-md p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <SettingsIcon className="h-5 w-5" /> Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <section className="mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Sound</h3>
          <div className="mb-3 flex items-center gap-3">
            <button
              onClick={() => setSettings({ audioEnabled: !settings.audioEnabled })}
              className={`rounded-lg p-2 ${settings.audioEnabled ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15' : 'bg-slate-100 text-slate-400 dark:bg-white/10'}`}
            >
              {settings.audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => setSettings({ volume: parseFloat(e.target.value) })}
              className="flex-1 accent-brand-600"
            />
            <select
              value={settings.soundType}
              onChange={(e) => setSettings({ soundType: e.target.value })}
              className="input w-28 !py-1.5 text-xs"
            >
              {SOUND_TYPES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => previewSound('warning')} className="btn-secondary btn-sm">Preview warning</button>
            <button onClick={() => previewSound('alarm')} className="btn-secondary btn-sm">Preview alarm</button>
          </div>
        </section>

        <section className="mb-6 space-y-2">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Alerts</h3>
          {[
            ['warningAt60', 'Warning at 60 seconds remaining'],
            ['warningAt30', 'Warning at 30 seconds remaining'],
            ['alarmAtZero', 'Alarm when the timer hits zero']
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={settings[key]} onChange={(e) => setSettings({ [key]: e.target.checked })} className="h-4 w-4 rounded accent-brand-600" />
              {label}
            </label>
          ))}
        </section>

        <section className="mb-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Color thresholds</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amber at</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="99"
                  className="input"
                  value={settings.warnThresholdPct}
                  onChange={(e) => setSettings({ warnThresholdPct: Number(e.target.value) })}
                />
                <span className="text-sm text-slate-400">%</span>
              </div>
            </div>
            <div>
              <label className="label">Red at</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="99"
                  className="input"
                  value={settings.dangerThresholdPct}
                  onChange={(e) => setSettings({ dangerThresholdPct: Number(e.target.value) })}
                />
                <span className="text-sm text-slate-400">%</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <label className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-white/5">
            <div>
              <div className="text-sm font-medium">Auto-advance</div>
              <div className="text-xs text-slate-400">Automatically start the next timer when one ends</div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoAdvance}
              onChange={(e) => setSettings({ autoAdvance: e.target.checked })}
              className="h-5 w-5 rounded accent-brand-600"
            />
          </label>
        </section>
      </div>
    </div>
  );
}
