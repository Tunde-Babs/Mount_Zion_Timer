import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTimerStore } from '../store/useTimerStore';
import { useUIStore } from '../store/useUIStore';
import { countTotalTimers, FREE_TIMER_LIMIT } from '../lib/plan';

export default function PlanBadge() {
  const { isPremium } = useAuth();
  const rooms = useTimerStore((s) => s.rooms);
  const openUpgradeModal = useUIStore((s) => s.openUpgradeModal);
  const used = countTotalTimers(rooms);

  if (isPremium) {
    return (
      <span className="pill bg-gradient-to-r from-brand-500 to-brand-700 text-white">
        <Sparkles className="h-3 w-3" /> Unlimited
      </span>
    );
  }

  return (
    <button
      onClick={() => openUpgradeModal()}
      className="pill bg-slate-100 text-slate-600 transition-colors hover:bg-brand-100 hover:text-brand-700 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-brand-500/20 dark:hover:text-brand-300"
      title="Upgrade for unlimited timers"
    >
      {used}/{FREE_TIMER_LIMIT} timers · Free plan
    </button>
  );
}
