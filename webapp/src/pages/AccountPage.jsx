import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, Sparkles, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUIStore } from '../store/useUIStore';
import AuthDisabledNotice from '../components/AuthDisabledNotice';
import { UPGRADE_PRICE_LABEL } from '../lib/plan';

export default function AccountPage() {
  const { enabled, user, profile, isPremium, loading, signOut } = useAuth();
  const showToast = useUIStore((s) => s.showToast);
  const navigate = useNavigate();

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

          <button onClick={handleSignOut} className="btn-secondary btn-md w-full">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
