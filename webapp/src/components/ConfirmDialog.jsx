import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';

export default function ConfirmDialog() {
  const confirm = useUIStore((s) => s.confirm);
  const closeConfirm = useUIStore((s) => s.closeConfirm);

  if (!confirm) return null;
  const { title, message, confirmLabel, tone, onConfirm } = confirm;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={closeConfirm}>
      <div
        className="card w-full max-w-sm p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className={`rounded-full p-2 ${tone === 'danger' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/15' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/15'}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={closeConfirm} className="btn-secondary btn-md">Cancel</button>
          <button
            onClick={() => {
              onConfirm?.();
              closeConfirm();
            }}
            className={tone === 'danger' ? 'btn-danger btn-md' : 'btn-primary btn-md'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
