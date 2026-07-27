import React from 'react';
import { Play, Pause, SkipForward, Trash2, Pencil, GripVertical } from 'lucide-react';
import { formatTime, percentUsed } from '../lib/time';

function barColor(remaining, duration, warnPct, dangerPct) {
  if (remaining < 0) return 'bg-rose-500';
  const pct = percentUsed(remaining, duration);
  if (pct >= dangerPct) return 'bg-rose-500';
  if (pct >= warnPct) return 'bg-amber-500';
  return 'bg-emerald-500';
}

export default function TimerTile({ timer, isOnAir, keyHint, settings, onToggle, onReset, onDelete, onEdit, dragProps }) {
  const color = barColor(timer.remainingTime, timer.duration, settings.warnThresholdPct, settings.dangerThresholdPct);

  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div
      {...dragProps}
      onClick={() => onToggle(timer.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle(timer.id);
        }
      }}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg dark:bg-white/[0.04] ${
        isOnAir ? 'border-brand-500 ring-1 ring-brand-500/50' : 'border-slate-200 dark:border-white/10'
      } ${dragProps?.['data-dragover'] ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-500/5' : ''} ${dragProps?.['data-dragging'] ? 'opacity-40' : ''}`}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="cursor-grab text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing dark:text-slate-600">
            <GripVertical className="h-3.5 w-3.5" />
          </span>
          {isOnAir ? (
            <span className="pill bg-brand-100 px-1.5 py-0.5 text-[10px] text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" /> On air
            </span>
          ) : (
            keyHint && <span className="text-[10px] text-slate-400">Key {keyHint}</span>
          )}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={stop(() => onEdit(timer))} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Edit" title="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={stop(() => onReset(timer.id))} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Reset" title="Reset">
            <SkipForward className="h-3.5 w-3.5" />
          </button>
          <button onClick={stop(() => onDelete(timer))} className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400" aria-label="Delete" title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mb-1 truncate text-sm font-semibold" title={timer.title || 'Untitled Timer'}>
        {timer.title || 'Untitled Timer'}
      </div>
      <div className="tabular mb-2 text-3xl font-bold leading-none">{formatTime(timer.remainingTime)}</div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
          <div
            className={`h-full transition-all duration-150 ${color}`}
            style={{ width: `${timer.remainingTime < 0 ? 100 : Math.min(100, percentUsed(timer.remainingTime, timer.duration))}%` }}
          />
        </div>
        <button
          onClick={stop(() => onToggle(timer.id))}
          className={`flex-shrink-0 rounded-lg p-1.5 text-white transition-transform active:scale-95 ${timer.isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          aria-label={timer.isRunning ? 'Pause' : 'Play'}
        >
          {timer.isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
