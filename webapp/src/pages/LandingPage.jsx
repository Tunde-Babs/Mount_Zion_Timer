import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, ArrowRight, Cast, Volume2, LayoutTemplate, Smartphone, Cloud, Keyboard,
  Check, Sparkles
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { FREE_TIMER_LIMIT, UPGRADE_PRICE_LABEL } from '../lib/plan';

const FEATURES = [
  { icon: Cast, title: 'Full-screen presenter view', desc: 'Send a clean countdown to any projector, TV, or second device — no cables, no extra software.' },
  { icon: Smartphone, title: 'Control from your phone', desc: 'Run the show from a tablet in the back row while the timer displays on stage.' },
  { icon: LayoutTemplate, title: 'Ready-made agendas', desc: 'Conference track, Sunday service, workshop day — start from a template and adjust in seconds.' },
  { icon: Volume2, title: 'Configurable audio cues', desc: 'Gentle, chime, or urgent alerts at 60s, 30s, and zero — so speakers feel it, not just see it.' },
  { icon: Cloud, title: 'Cloud-synced schedules', desc: 'Save your running orders once, reuse them from any device, every week.' },
  { icon: Keyboard, title: 'Built for live operators', desc: 'Full keyboard control, drag-and-drop reordering, and an undo on every delete.' }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-light text-slate-900 dark:bg-surface-dark dark:text-slate-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-brand-600 p-1.5"><Clock className="h-4 w-4 text-white" /></div>
          <span className="font-bold">Platform Timer</span>
        </div>
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/pricing" className="btn-ghost btn-sm hidden sm:inline-flex">Pricing</Link>
          <Link to="/login" className="btn-ghost btn-sm">Sign in</Link>
          <Link to="/app" className="btn-primary btn-sm">Open App <ArrowRight className="h-3.5 w-3.5" /></Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-16 pt-10 text-center sm:pt-16">
        <span className="pill mx-auto mb-5 bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          <Sparkles className="h-3 w-3" /> No install. No subscription. Just a link.
        </span>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Keep every session<br className="hidden sm:block" /> running <span className="text-brand-600 dark:text-brand-400">on time</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
          A professional countdown timer for conferences, services, and live events — with a distraction-free
          presenter screen your speakers can actually see.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/app" className="btn-primary btn-lg">Start free — {FREE_TIMER_LIMIT} timers, no signup <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/pricing" className="btn-secondary btn-lg">See pricing</Link>
        </div>
        <p className="mt-3 text-xs text-slate-400">Runs entirely in your browser. Works on Mac, Windows, iPad, and phones.</p>
      </section>

      <section className="border-y border-slate-200 bg-white/50 py-16 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Everything a live operator actually needs</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-5">
                <div className="mb-3 inline-flex rounded-lg bg-brand-100 p-2 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 font-semibold">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Simple, one-time pricing</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">No subscriptions. Pay once, use it forever.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <PricingCard
            name="Free"
            price="€0"
            tagline="Perfect for a single session or a quick trial"
            perks={[`${FREE_TIMER_LIMIT} timers`, 'Presenter view + live sync', 'Audio alerts & templates', 'Schedules saved on this device']}
            cta={{ label: 'Start free', to: '/app' }}
          />
          <PricingCard
            highlight
            name="Unlimited"
            price={`From ${UPGRADE_PRICE_LABEL}`}
            tagline="One-time payment, minimum shown — pay more if you're able"
            perks={['Unlimited timers & sessions', 'Free account included', 'Cloud-synced schedule library', 'Priority for new features']}
            cta={{ label: 'Upgrade', to: '/pricing' }}
          />
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-400 dark:border-white/10">
        © {new Date().getFullYear()} Platform Timer. Built for conferences, services, and live events.
      </footer>
    </div>
  );
}

function PricingCard({ name, price, tagline, perks, cta, highlight }) {
  return (
    <div className={`card p-6 ${highlight ? 'border-brand-400 ring-1 ring-brand-400/50 dark:border-brand-500/60' : ''}`}>
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{tagline}</p>
      <div className="mb-5 text-3xl font-extrabold">{price}</div>
      <ul className="mb-6 space-y-2">
        {perks.map((p) => (
          <li key={p} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 flex-shrink-0 text-emerald-500" /> {p}
          </li>
        ))}
      </ul>
      <Link to={cta.to} className={highlight ? 'btn-primary btn-md w-full' : 'btn-secondary btn-md w-full'}>{cta.label}</Link>
    </div>
  );
}
