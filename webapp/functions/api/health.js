import { isAdminConfigured } from '../_lib/supabaseAdmin.js';

export async function onRequestGet({ env }) {
  return Response.json({
    ok: true,
    stripeConfigured: Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_ID),
    supabaseAdminConfigured: isAdminConfigured(env)
  });
}
