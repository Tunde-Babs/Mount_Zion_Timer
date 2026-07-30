import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUIStore } from '../store/useUIStore';
import AuthDisabledNotice from '../components/AuthDisabledNotice';
import { FREE_TIMER_LIMIT, UPGRADE_PRICE_LABEL } from '../lib/plan';

export default function SignupPage() {
  const { enabled, signUpWithPassword } = useAuth();
  const showToast = useUIStore((s) => s.showToast);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!enabled) return <AuthDisabledNotice />;

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return showToast('Password must be at least 8 characters.', { type: 'error' });
    setLoading(true);
    const { data, error } = await signUpWithPassword(email, password);
    setLoading(false);
    if (error) return showToast(error.message, { type: 'error' });
    if (data.session) navigate('/app');
    else setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-light px-4 dark:bg-surface-dark">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="rounded-lg bg-brand-600 p-1.5"><Clock className="h-4 w-4 text-white" /></div>
          <span className="font-bold">Platform Timer</span>
        </Link>
        <div className="card p-6">
          <h1 className="mb-1 text-xl font-bold">Create a free account</h1>
          <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
            A free account still keeps the {FREE_TIMER_LIMIT}-timer limit — it just syncs your saved schedules. Want unlimited
            timers too? <Link to="/pricing" className="font-medium text-brand-600 dark:text-brand-400">See the {UPGRADE_PRICE_LABEL} upgrade</Link>.
          </p>

          {sent ? (
            <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Sparkles className="mb-2 h-5 w-5" />
              Almost done — check <strong>{email}</strong> to confirm your account.
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="label">Email</label>
                <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@church.org" />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" required minLength={8} className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary btn-md w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Create account
              </button>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account? <Link to="/login" className="font-medium text-brand-600 dark:text-brand-400">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
