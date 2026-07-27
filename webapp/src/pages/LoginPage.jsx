import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, Loader2, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUIStore } from '../store/useUIStore';
import AuthDisabledNotice from '../components/AuthDisabledNotice';

export default function LoginPage() {
  const { enabled, signInWithPassword, sendMagicLink } = useAuth();
  const showToast = useUIStore((s) => s.showToast);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  if (!enabled) return <AuthDisabledNotice />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInWithPassword(email, password);
    setLoading(false);
    if (error) return showToast(error.message, { type: 'error' });
    navigate('/app');
  };

  const magicLink = async () => {
    if (!email) return showToast('Enter your email first.', { type: 'error' });
    setLoading(true);
    const { error } = await sendMagicLink(email);
    setLoading(false);
    if (error) return showToast(error.message, { type: 'error' });
    setMagicSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-light px-4 dark:bg-surface-dark">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="rounded-lg bg-brand-600 p-1.5"><Clock className="h-4 w-4 text-white" /></div>
          <span className="font-bold">Mount Zion Timer</span>
        </Link>
        <div className="card p-6">
          <h1 className="mb-1 text-xl font-bold">Welcome back</h1>
          <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">Sign in to sync your schedules across devices.</p>

          {magicSent ? (
            <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Mail className="mb-2 h-5 w-5" />
              Check <strong>{email}</strong> for a sign-in link.
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="label">Email</label>
                <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@church.org" />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary btn-md w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Sign in
              </button>
              <button type="button" onClick={magicLink} disabled={loading} className="btn-secondary btn-md w-full">
                Email me a magic link instead
              </button>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            No account yet? <Link to="/signup" className="font-medium text-brand-600 dark:text-brand-400">Sign up</Link>
          </p>
        </div>
        <Link to="/app" className="mt-4 flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <ArrowLeft className="h-3.5 w-3.5" /> Continue without an account
        </Link>
      </div>
    </div>
  );
}
