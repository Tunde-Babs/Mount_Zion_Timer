import Stripe from 'stripe';
import { markProfilePremium, ensurePremiumAccountForEmail, isAdminConfigured } from '../_lib/supabaseAdmin.js';

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Stripe is not configured on this server.', { status: 500 });
  }
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });

  // Signature verification needs the raw body — Workers' Request gives that
  // directly via .text(), no special "raw body" middleware needed like Express did.
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;
  try {
    // constructEventAsync (Web Crypto/SubtleCrypto-based) is the Workers-compatible
    // counterpart to constructEvent, which relies on Node's synchronous crypto module.
    event = await stripe.webhooks.constructEventAsync(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.payment_status !== 'paid') {
        console.warn(`Checkout session ${session.id} completed but payment_status=${session.payment_status}; skipping.`);
      } else if (!isAdminConfigured(env)) {
        console.error('Payment received but SUPABASE_SERVICE_ROLE_KEY is not configured — cannot grant premium access. Session:', session.id);
      } else if (session.client_reference_id) {
        await markProfilePremium(env, session.client_reference_id);
        console.log(`Granted premium to existing user ${session.client_reference_id}`);
      } else {
        const email = session.customer_details?.email || session.customer_email;
        const origin = new URL(request.url).origin;
        const userId = await ensurePremiumAccountForEmail(env, email, `${origin}/app`);
        console.log(`Granted premium to new/matched account ${userId} (${email})`);
      }
    }
    return Response.json({ received: true });
  } catch (err) {
    console.error('Error handling webhook event:', err);
    // Respond 500 so Stripe retries — this is likely a transient DB issue, not a bad event.
    return new Response('Internal error handling webhook.', { status: 500 });
  }
}
