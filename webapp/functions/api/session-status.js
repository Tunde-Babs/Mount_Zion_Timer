import Stripe from 'stripe';

export async function onRequestGet({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) {
    return Response.json({ error: 'Payments are not configured on this server yet.' }, { status: 500 });
  }
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });

  const sessionId = new URL(request.url).searchParams.get('session_id');
  if (!sessionId) return Response.json({ error: 'Missing session_id.' }, { status: 400 });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return Response.json({
      paid: session.payment_status === 'paid',
      email: session.customer_details?.email || session.customer_email
    });
  } catch (err) {
    console.error('Failed to retrieve checkout session:', err);
    return Response.json({ error: 'Could not verify payment status.' }, { status: 500 });
  }
}
