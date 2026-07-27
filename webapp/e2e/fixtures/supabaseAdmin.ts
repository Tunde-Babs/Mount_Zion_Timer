import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Reuses the same .dev.vars file as scripts/createAdmin.js — this is the local,
// test-mode Supabase project, never production credentials.
const here = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(here, '../../.dev.vars') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseAdminConfigured() {
  return Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);
}

function getAdmin() {
  if (!isSupabaseAdminConfigured()) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set in webapp/.dev.vars.');
  }
  return createClient(SUPABASE_URL as string, SERVICE_ROLE_KEY as string, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// Bypasses the signup confirmation email (email_confirm: true) the same way
// scripts/createAdmin.js does — we want a login-ready account, not to also
// automate reading a confirmation email.
export async function createConfirmedTestUser(email: string, password: string) {
  const admin = getAdmin();
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  return data.user;
}

export async function isProfilePremium(userId: string) {
  const admin = getAdmin();
  const { data, error } = await admin.from('profiles').select('is_premium').eq('id', userId).single();
  if (error) throw error;
  return Boolean(data?.is_premium);
}

export async function deleteTestUser(userId: string) {
  const admin = getAdmin();
  await admin.auth.admin.deleteUser(userId);
}

// Supabase's admin API has no "get user by email" — listUsers() + a client-side
// find is the documented workaround. Fine for a handful of test accounts; would
// need pagination if this project ever accumulates many.
export async function deleteTestUserByEmail(email: string) {
  const admin = getAdmin();
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw error;
  const existing = data.users.find((u) => u.email === email);
  if (existing) await admin.auth.admin.deleteUser(existing.id);
}
