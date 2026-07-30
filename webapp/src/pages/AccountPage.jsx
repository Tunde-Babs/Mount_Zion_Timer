import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, LogOut, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUIStore } from '../store/useUIStore';
import AuthDisabledNotice from '../components/AuthDisabledNotice';
import { UPGRADE_PRICE_LABEL } from '../lib/plan';

export default function AccountPage() {
  const { enabled, user, profile, isPremium, loading, signOut, updatePassword } = useAuth();
  const showToast = useUIStore((s) => s.showToast);
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (enabled && !loading && !user) navigate('/login');
  }, [enabled, loading, user, navigate]);

  if (!enabled) return <AuthDisabledNotice />;
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    showToast('Signed out.');
    navigate('/');
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (password !== confirm) return showToast('Those passwords don’t match.', { type: 'error' });
    setSavingPassword(true);
    const { error } = await updatePassword(password);
    setSavingPassword(false);
    if (error) return showToast(error.message, { type: 'error' });
    setPassword('');
    setConfirm('');
    showToast('Password saved.');
  };

  return (
    <div className="min-h-screen bg-surface-light px-4 py-10 dark:bg-surface-dark">
      <div className="mx-auto max-w-lg">
        <Link to="/app" className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to app
        </Link>

        <div className="card p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-semibold">{user.email}</div>
              <div className="text-xs text-slate-400">Member since {new Date(user.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          <div className={`mb-5 rounded-xl p-4 ${isPremium ? 'bg-gradient-to-br from-brand-600 to-brand-800 text-white' : 'bg-slate-50 dark:bg-white/5'}`}>
            {isPremium ? (
              <>
                <div className="mb-1 flex items-center gap-1.5 font-semibold"><Sparkles className="h-4 w-4" /> Unlimited plan</div>
                <p className="text-sm text-brand-100">
                  Thanks for your support{profile?.premium_since ? ` since ${new Date(profile.premium_since).toLocaleDateString()}` : ''}. Enjoy unlimited timers and rooms.
                </p>
              </>
            ) : (
              <>
                <div className="mb-1 font-semibold">Free plan</div>
                <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Upgrade once for {UPGRADE_PRICE_LABEL} to remove the timer cap, forever.</p>
                <Link to="/pricing" className="btn-primary btn-sm">Upgrade</Link>
              </>
            )}
          </div>

          {/* Deliberately worded to cover both cases: customers created by the
              Stripe webhook's inviteUserByEmail arrive here with no password at
              all, and the client has no reliable way to tell them apart from
              someone changing an existing one. */}
          <div className="mb-5 border-t border-slate-200 pt-5 dark:border-white/10">
            <div className="mb-1 font-semibold">Password</div>
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
              Set one, or change the one you have. Signing in with a password works on any device.
            </p>
            <form onSubmit={savePassword} className="space-y-3">
              <div>
                <label className="label">New password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="input"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Type it again"
                />
              </div>
              <button type="submit" disabled={savingPassword} className="btn-secondary btn-md w-full">
                {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Save password
              </button>
            </form>
          </div>

          <button onClick={handleSignOut} className="btn-secondary btn-md w-full">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
