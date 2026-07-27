import { createClient } from '@supabase/supabase-js';

// Cloudflare Pages Functions receive env vars per-request via `context.env`,
// not process.env — so unlike the old Express server, everything here takes
// `env` as an explicit argument instead of reading module-level globals.

export function isAdminConfigured(env) {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabaseAdmin(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

/** Resolves the caller's Supabase user id from a `Bearer <access_token>` header, or null. */
export async function getUserIdFromAuthHeader(env, authHeader) {
  if (!isAdminConfigured(env) || !authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length);
  const { data, error } = await getSupabaseAdmin(env).auth.getUser(token);
  if (error) return null;
  return data.user?.id || null;
}

/** Marks a profile as premium. Assumes the `profiles` row already exists (created by the DB trigger on signup). */
export async function markProfilePremium(env, userId) {
  const { error } = await getSupabaseAdmin(env)
    .from('profiles')
    .update({ is_premium: true, premium_since: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

/**
 * Ensures a premium account exists for `email`, creating one via invite if needed.
 * Returns the resolved user id.
 */
export async function ensurePremiumAccountForEmail(env, email, redirectTo) {
  const supabaseAdmin = getSupabaseAdmin(env);
  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, { redirectTo });

  let userId;
  if (!inviteError) {
    userId = inviteData.user.id;
  } else if (/already.*registered/i.test(inviteError.message || '')) {
    // Existing account (e.g. they signed up free, then paid from a checkout that
    // wasn't logged in). Look them up by the profiles row the signup trigger created.
    const { data: existing, error: lookupError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (lookupError || !existing) throw new Error(`Payment succeeded but no account was found for ${email}. Resolve manually.`);
    userId = existing.id;
  } else {
    throw inviteError;
  }

  await markProfilePremium(env, userId);
  return userId;
}
