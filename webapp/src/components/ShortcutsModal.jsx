import React from 'react';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  ['Play / pause the on-air timer', 'Space'],
  ['Add a new timer', 'N'],
  ['Reset the on-air timer', 'R'],
  ['Toggle mute', 'M'],
  ['Switch on-air timer', '1 – 9'],
  ['Show this help', '?'],
  ['Close dialogs', 'Esc']
];

export default function ShortcutsModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-sm p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Keyboard className="h-5 w-5" /> Keyboard Shortcuts
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-1">
          {SHORTCUTS.map(([action, key]) => (
            <div key={action} className="flex items-center justify-between border-b border-slate-100 py-2.5 text-sm last:border-0 dark:border-white/5">
              <span className="text-slate-600 dark:text-slate-300">{action}</span>
              <kbd className="rounded bg-slate-100 px-2 py-1 font-mono text-xs dark:bg-white/10">{key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
