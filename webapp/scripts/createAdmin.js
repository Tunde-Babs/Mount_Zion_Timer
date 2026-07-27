// One-off utility: grants a premium account directly, bypassing Stripe.
// Usage:  npm run create-admin -- <email> <password>
//
// This runs as a plain Node script (not a Cloudflare Function — it's a local
// maintenance tool, never deployed), reading secrets from .dev.vars since
// that's where backend/Supabase credentials live for this project.
import 'dotenv/config';
import { config as loadDevVars } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

loadDevVars({ path: new URL('../.dev.vars', import.meta.url).pathname });

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error('Usage: npm run create-admin -- <email> <password>');
  process.exit(1);
}
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set in .dev.vars — nothing to connect to yet.');
  process.exit(1);
}

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email,
  password,
  email_confirm: true // skip the confirmation email — this account is trusted by fiat, not self-signup
});

if (error) {
  console.error('Failed to create user:', error.message);
  process.exit(1);
}

const { error: updateError } = await supabaseAdmin
  .from('profiles')
  .update({ is_premium: true, premium_since: new Date().toISOString() })
  .eq('id', data.user.id);

if (updateError) {
  console.error('User created but failed to mark premium:', updateError.message);
  process.exit(1);
}

console.log(`✓ Created premium account for ${email} (user id: ${data.user.id})`);
