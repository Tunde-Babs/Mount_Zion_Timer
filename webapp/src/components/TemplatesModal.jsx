import React from 'react';
import { X, LayoutTemplate, ArrowRight } from 'lucide-react';
import { AGENDA_TEMPLATES } from '../lib/templates';
import { useTimerStore } from '../store/useTimerStore';
import { useUIStore } from '../store/useUIStore';
import { useAuth } from '../context/AuthContext';
import { countTotalTimers, FREE_TIMER_LIMIT } from '../lib/plan';

export default function TemplatesModal({ onClose }) {
  const rooms = useTimerStore((s) => s.rooms);
  const addTimersFromTemplate = useTimerStore((s) => s.addTimersFromTemplate);
  const showToast = useUIStore((s) => s.showToast);
  const openUpgradeModal = useUIStore((s) => s.openUpgradeModal);
  const { isPremium } = useAuth();

  const used = countTotalTimers(rooms);

  const apply = (template) => {
    const wouldTotal = used + template.timers.length;
    if (!isPremium && wouldTotal > FREE_TIMER_LIMIT) {
      onClose();
      openUpgradeModal(`"${template.name}" has ${template.timers.length} timers — that's more than your remaining free slots.`);
      return;
    }
    addTimersFromTemplate(template.timers, template.name);
    showToast(`Added "${template.name}" (${template.timers.length} timers).`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="card max-h-[85vh] w-full max-w-2xl overflow-y-auto p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <LayoutTemplate className="h-5 w-5" /> Agenda Templates
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">Add a ready-made running order to the current session in one click. You can edit every timer afterwards.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {AGENDA_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => apply(t)}
              className="group rounded-xl border border-slate-200 p-4 text-left transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-white/10 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/5"
            >
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-semibold">{t.name}</h3>
                <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
              </div>
              <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">{t.description}</p>
              <span className="text-xs font-medium text-slate-400">{t.timers.length} timers</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
