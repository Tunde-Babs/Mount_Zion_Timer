import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface-light px-4 text-center dark:bg-surface-dark">
      <Clock className="h-10 w-10 text-slate-300 dark:text-slate-700" />
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-slate-500 dark:text-slate-400">That link doesn't lead anywhere in Mount Zion Timer.</p>
      <Link to="/" className="btn-primary btn-md mt-2">Go home</Link>
    </div>
  );
}
