import { supabase, isSupabaseConfigured } from './supabaseClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Kicks off the one-time upgrade (€20 minimum): asks our server for a Stripe Checkout
// Session (never talk to Stripe's secret API from the browser) and redirects.
export async function startUpgradeCheckout({ email } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (isSupabaseConfigured) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  const res = await fetch(`${API_BASE}/create-checkout-session`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, returnPath: window.location.pathname })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Could not start checkout. Please try again.');
  }
  const { url } = await res.json();
  if (!url) throw new Error('Checkout session did not return a redirect URL.');
  window.location.href = url;
}

export async function fetchCheckoutSessionStatus(sessionId) {
  const res = await fetch(`${API_BASE}/session-status?session_id=${encodeURIComponent(sessionId)}`);
  if (!res.ok) throw new Error('Could not verify payment status.');
  return res.json();
}
