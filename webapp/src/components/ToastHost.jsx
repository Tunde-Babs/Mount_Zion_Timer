import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X, Undo2 } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';

const ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info, warning: AlertTriangle };
const TONES = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-rose-600 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-slate-800 text-white'
};

export default function ToastHost() {
  const toasts = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || Info;
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-2.5 rounded-xl px-4 py-3 shadow-xl animate-slide-up ${TONES[toast.type] || TONES.info}`}
          >
            <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span className="flex-1 text-sm font-medium leading-snug">{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action.onClick();
                  dismissToast(toast.id);
                }}
                className="flex items-center gap-1 rounded-md bg-white/20 px-2 py-1 text-xs font-semibold hover:bg-white/30"
              >
                <Undo2 className="h-3 w-3" />
                {toast.action.label}
              </button>
            )}
            <button onClick={() => dismissToast(toast.id)} className="text-white/70 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
