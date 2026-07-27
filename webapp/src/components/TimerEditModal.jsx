import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { formatTimeToInput, parseTimeInput } from '../lib/time';

const ADJUST_STEPS = [1, 2, 3, 5, 10];

export default function TimerEditModal({ timer, onUpdate, onAdjust, onDelete, onClose }) {
  const [title, setTitle] = useState(timer.title);
  const [notes, setNotes] = useState(timer.notes);
  const [durationInput, setDurationInput] = useState(timer.timeInput || formatTimeToInput(timer.duration));

  const commitTitle = () => onUpdate(timer.id, { title });
  const commitNotes = () => onUpdate(timer.id, { notes });
  const commitDuration = () => {
    const ms = parseTimeInput(durationInput);
    if (ms > 0) onUpdate(timer.id, { duration: ms, remainingTime: ms, timeInput: durationInput });
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-sm p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit timer</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">Timer title</label>
            <input className="input" placeholder="Enter timer title" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={commitTitle} />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input" placeholder="Shown under the title on the presenter view" value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={commitNotes} />
          </div>
          <div>
            <label className="label">Duration (MM:SS)</label>
            <input
              className="input"
              value={durationInput}
              onChange={(e) => setDurationInput(e.target.value)}
              onBlur={commitDuration}
              onKeyDown={(e) => e.key === 'Enter' && commitDuration()}
            />
          </div>
          <div>
            <label className="label">Quick adjust</label>
            <div className="mb-1.5 flex gap-1.5">
              {ADJUST_STEPS.map((m) => (
                <button key={`+${m}`} onClick={() => onAdjust(timer.id, m * 60000)} className="flex-1 rounded bg-emerald-100 py-1 text-xs font-medium text-emerald-700 transition-transform hover:bg-emerald-200 active:scale-95 dark:bg-emerald-500/15 dark:text-emerald-300">
                  +{m}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              {ADJUST_STEPS.map((m) => (
                <button key={`-${m}`} onClick={() => onAdjust(timer.id, -m * 60000)} className="flex-1 rounded bg-rose-100 py-1 text-xs font-medium text-rose-700 transition-transform hover:bg-rose-200 active:scale-95 dark:bg-rose-500/15 dark:text-rose-300">
                  -{m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => {
              onDelete(timer);
              onClose();
            }}
            className="btn-danger btn-md"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
          <button onClick={onClose} className="btn-primary btn-md flex-1">Done</button>
        </div>
      </div>
    </div>
  );
}
