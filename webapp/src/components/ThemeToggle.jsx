import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTimerStore } from '../store/useTimerStore';

const OPTIONS = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' }
];

export default function ThemeToggle({ className = '' }) {
  const theme = useTimerStore((s) => s.theme);
  const setTheme = useTimerStore((s) => s.setTheme);

  return (
    <div className={`inline-flex items-center rounded-lg bg-slate-100 p-1 dark:bg-white/5 ${className}`}>
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          aria-label={label}
          className={`rounded-md p-1.5 transition-colors ${
            theme === value ? 'bg-white text-brand-600 shadow-sm dark:bg-white/15 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
