import React, { useState } from 'react';
import { X, Sparkles, Check, Loader2 } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { useAuth } from '../context/AuthContext';
import { startUpgradeCheckout } from '../lib/checkout';
import { UPGRADE_PRICE_LABEL, FREE_TIMER_LIMIT } from '../lib/plan';

const PERKS = [
  'Unlimited timers, in unlimited sessions',
  'Free account with cloud-synced schedule library',
  'Control your presenter view from any device',
  'One payment, yours forever — no subscription'
];

export default function UpgradeModal() {
  const { open, reason } = useUIStore((s) => s.upgradeModal);
  const closeUpgradeModal = useUIStore((s) => s.closeUpgradeModal);
  const showToast = useUIStore((s) => s.showToast);
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await startUpgradeCheckout({ email: user?.email || email });
    } catch (err) {
      showToast(err.message, { type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={closeUpgradeModal}>
      <div className="card relative w-full max-w-md overflow-hidden p-0 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <button onClick={closeUpgradeModal} className="absolute right-4 top-4 z-10 text-slate-400 hover:text-slate-700 dark:hover:text-white">
          <X className="h-5 w-5" />
        </button>
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-8 text-white">
          <Sparkles className="mb-3 h-7 w-7 text-brand-200" />
          <h2 className="text-2xl font-bold">Go Unlimited</h2>
          <p className="mt-1 text-sm text-brand-100">
            {reason || `You've hit the free plan's ${FREE_TIMER_LIMIT}-timer limit.`}
          </p>
        </div>
        <div className="p-6">
          <div className="mb-1 flex items-baseline gap-1">
            <span className="text-sm font-medium text-slate-400">From</span>
            <span className="text-3xl font-extrabold">{UPGRADE_PRICE_LABEL}</span>
          </div>
          <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">One-time, forever — pay more at checkout if you're able.</p>
          <ul className="mb-6 space-y-2.5">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                {perk}
              </li>
            ))}
          </ul>

          {!user && (
            <div className="mb-4">
              <label className="label">Email for your new account</label>
              <input
                type="email"
                className="input"
                placeholder="you@church.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <button
            onClick={handleUpgrade}
            disabled={loading || (!user && !email)}
            className="btn-primary btn-lg w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? 'Redirecting to secure checkout…' : `Upgrade — from ${UPGRADE_PRICE_LABEL}`}
          </button>
          <p className="mt-3 text-center text-xs text-slate-400">Secure payment via Stripe. Not ready to pay? You can keep using {FREE_TIMER_LIMIT} timers for free, forever.</p>
        </div>
      </div>
    </div>
  );
}
