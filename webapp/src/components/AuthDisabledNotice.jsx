import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowLeft, CloudOff } from 'lucide-react';

export default function AuthDisabledNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-light px-4 dark:bg-surface-dark">
      <div className="w-full max-w-sm text-center">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="rounded-lg bg-brand-600 p-1.5"><Clock className="h-4 w-4 text-white" /></div>
          <span className="font-bold">Platform Timer</span>
        </Link>
        <div className="card p-6">
          <CloudOff className="mx-auto mb-3 h-8 w-8 text-slate-400" />
          <h1 className="mb-1 text-lg font-semibold">Accounts aren't set up yet</h1>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            This deployment hasn't been connected to Supabase, so sign-in and cloud sync are unavailable. The free
            timer app still works fully in your browser.
          </p>
          <Link to="/app" className="btn-primary btn-md w-full">
            <ArrowLeft className="h-4 w-4" /> Back to the app
          </Link>
        </div>
      </div>
    </div>
  );
}
