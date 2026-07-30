import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUIStore } from '../store/useUIStore';
import AuthDisabledNotice from '../components/AuthDisabledNotice';

// Landing page for the link in a "reset your password" email. Supabase's client
// runs with detectSessionInUrl (the default), so by the time this renders it has
// already swapped the recovery token in the URL fragment for a real session —
// which is why there's no token handling here, just a signed-in check.
//
// Doubles as the "set your first password" screen: customers created by the
// Stripe webhook's inviteUserByEmail have no password, and updateUser({ password })
// behaves the same whether it's replacing one or creating one.
export default function ResetPasswordPage() {
  const { enabled, user, loading, updatePassword } = useAuth();
  const showToast = useUIStore((s) => s.showToast);
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  if (!enabled) return <AuthDisabledNotice />;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return showToast('Those passwords don’t match.', { type: 'error' });
    setSaving(true);
    const { error } = await updatePassword(password);
    setSaving(false);
    if (error) return showToast(error.message, { type: 'error' });
    showToast('Password saved. You’re all set.');
    navigate('/app');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-light px-4 dark:bg-surface-dark">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="rounded-lg bg-brand-600 p-1.5"><Clock className="h-4 w-4 text-white" /></div>
          <span className="font-bold">Platform Timer</span>
        </Link>
        <div className="card p-6">
          {/* No session means the link was already used, expired, or opened in a
              different browser than it was requested from. */}
          {!user ? (
            <>
              <h1 className="mb-1 text-xl font-bold">This link has expired</h1>
              <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
                Password links can only be used once, and they stop working after a while. Request a fresh one and it
                will arrive in a moment.
              </p>
              <Link to="/login" className="btn-primary btn-md w-full">Back to sign in</Link>
            </>
          ) : (
            <>
              <h1 className="mb-1 text-xl font-bold">Choose a password</h1>
              <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
                Setting a password for <strong>{user.email}</strong>. You can sign in with it from any device.
              </p>
              <form onSubmit={submit} className="space-y-3">
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
                <button type="submit" disabled={saving} className="btn-primary btn-md w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Save password
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
