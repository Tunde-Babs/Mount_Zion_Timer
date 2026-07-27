import Stripe from 'stripe';
import { getUserIdFromAuthHeader } from '../_lib/supabaseAdmin.js';

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID) {
    return Response.json({ error: 'Payments are not configured on this server yet.' }, { status: 500 });
  }

  // Workers have no Node `http` module, so Stripe needs the fetch-based HTTP client explicitly.
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });

  const { email, returnPath } = await request.json().catch(() => ({}));
  const userId = await getUserIdFromAuthHeader(env, request.headers.get('Authorization'));

  if (!userId && !email) {
    return Response.json({ error: 'An email address is required to start checkout.' }, { status: 400 });
  }

  // Same-origin deployment (Pages + Functions share one domain), so we can derive
  // the site origin from the incoming request instead of a hardcoded CLIENT_URL —
  // this also makes preview deployments (e.g. *.pages.dev branch URLs) work for free.
  const origin = new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
      customer_email: userId ? undefined : email,
      client_reference_id: userId || undefined,
      success_url: `${origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${returnPath && returnPath.startsWith('/') ? returnPath : '/pricing'}`
    });
    return Response.json({ url: session.url });
  } catch (err) {
    console.error('Failed to create checkout session:', err);
    return Response.json({ error: 'Could not start checkout. Please try again.' }, { status: 500 });
  }
}
