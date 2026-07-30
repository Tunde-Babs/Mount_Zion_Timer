import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowLeft, Check, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { startUpgradeCheckout } from '../lib/checkout';
import { useUIStore } from '../store/useUIStore';
import { FREE_TIMER_LIMIT, UPGRADE_PRICE_LABEL } from '../lib/plan';

const FAQS = [
  ['Is it really a one-time payment?', `Yes — ${UPGRADE_PRICE_LABEL} minimum, once, no subscription, no renewal. Your account keeps unlimited timers for as long as you use it.`],
  ['Can I pay more than the minimum?', `${UPGRADE_PRICE_LABEL} is the minimum, not a fixed price — at checkout you can enter any amount at or above that if you'd like to support the project further.`],
  ['What happens to my free-plan timers?', 'Nothing — everything you already built carries over. The upgrade just removes the timer cap and adds cloud sync.'],
  ['Do I need an account for the free plan?', 'No. The free plan works entirely in your browser with no signup. An account is created automatically when you upgrade.'],
  ['Can I use it on multiple devices?', 'Yes. Once upgraded, sign in anywhere to sync your saved schedules, and use the shareable presenter link to display on a separate screen from any device.']
];

export default function PricingPage() {
  const { user, isPremium } = useAuth();
  const showToast = useUIStore((s) => s.showToast);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-surface-light text-slate-900 dark:bg-surface-dark dark:text-slate-100">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-brand-600 p-1.5"><Clock className="h-4 w-4 text-white" /></div>
          <span className="font-bold">Platform Timer</span>
        </Link>
        <Link to="/app" className="btn-ghost btn-sm"><ArrowLeft className="h-3.5 w-3.5" /> Back to app</Link>
      </header>

      <section className="mx-auto max-w-md px-6 py-10 text-center">
        <h1 className="text-3xl font-extrabold sm:text-4xl">One plan. One payment.</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">Start free with {FREE_TIMER_LIMIT} timers. Upgrade whenever you outgrow it.</p>
      </section>

      <section className="mx-auto max-w-md px-6 pb-16">
        {isPremium ? (
          <div className="card p-6 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-brand-500" />
            <h2 className="text-lg font-semibold">You're already on Unlimited</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Thanks for supporting Platform Timer.</p>
            <Link to="/app" className="btn-primary btn-md mt-4">Go to the app</Link>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-8 text-white">
              <div className="mb-1 text-sm font-medium text-brand-100">Unlimited</div>
              <div className="text-4xl font-extrabold">From {UPGRADE_PRICE_LABEL}</div>
              <div className="text-sm text-brand-100">one-time · lifetime access · pay more if you're able</div>
            </div>
            <div className="p-6">
              <ul className="mb-6 space-y-2.5">
                {['Unlimited timers, in unlimited sessions', 'Free account with cloud-synced schedules', 'Control from any device, presenter view on another', 'One payment — no subscription, ever'].map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" /> {p}
                  </li>
                ))}
              </ul>
              {!user && (
                <div className="mb-4">
                  <label className="label">Email for your new account</label>
                  <input type="email" className="input" placeholder="you@church.org" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              )}
              <button onClick={handleUpgrade} disabled={loading || (!user && !email)} className="btn-primary btn-lg w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? 'Redirecting…' : `Upgrade — from ${UPGRADE_PRICE_LABEL}`}
              </button>
              <p className="mt-3 text-center text-xs text-slate-400">Secure payment via Stripe.</p>
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-20">
        <h2 className="mb-6 text-center text-xl font-bold">Frequently asked questions</h2>
        <div className="space-y-4">
          {FAQS.map(([q, a]) => (
            <div key={q} className="card p-4">
              <h3 className="mb-1 font-semibold">{q}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
