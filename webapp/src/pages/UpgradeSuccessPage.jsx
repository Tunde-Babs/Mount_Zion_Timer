import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle, Mail, ArrowRight } from 'lucide-react';
import { fetchCheckoutSessionStatus } from '../lib/checkout';
import { useAuth } from '../context/AuthContext';

export default function UpgradeSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const { user, refreshProfile } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | paid | pending | error
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!sessionId) return setStatus('error');
    fetchCheckoutSessionStatus(sessionId)
      .then((res) => {
        setEmail(res.email || '');
        if (res.paid) {
          setStatus('paid');
          if (user) refreshProfile();
        } else {
          setStatus('pending');
        }
      })
      .catch(() => setStatus('error'));
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-light px-4 dark:bg-surface-dark">
      <div className="card w-full max-w-sm p-6 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-brand-500" />
            <h1 className="text-lg font-semibold">Confirming your payment…</h1>
          </>
        )}

        {status === 'paid' && (
          <>
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
            <h1 className="mb-2 text-lg font-semibold">You're unlimited 🎉</h1>
            {user ? (
              <>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Your account has been upgraded. Enjoy unlimited timers and sessions.</p>
                <Link to="/app" className="btn-primary btn-md w-full">Open the app <ArrowRight className="h-4 w-4" /></Link>
              </>
            ) : (
              <>
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-brand-50 p-3 text-left text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  We've emailed <strong>{email}</strong> a link to set your password and sign in.
                </div>
                <Link to="/login" className="btn-secondary btn-md w-full">Go to sign in</Link>
              </>
            )}
          </>
        )}

        {status === 'pending' && (
          <>
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-amber-500" />
            <h1 className="mb-2 text-lg font-semibold">Payment processing</h1>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">This can take a few seconds. Refresh this page shortly, or check your email for confirmation.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="mx-auto mb-3 h-10 w-10 text-rose-500" />
            <h1 className="mb-2 text-lg font-semibold">Couldn't verify payment</h1>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">If you were charged, contact support with your receipt and we'll sort it out right away.</p>
            <Link to="/pricing" className="btn-secondary btn-md w-full">Back to pricing</Link>
          </>
        )}
      </div>
    </div>
  );
}
