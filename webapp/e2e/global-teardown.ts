import fs from 'node:fs';
import { deleteTestUser, isSupabaseAdminConfigured } from './fixtures/supabaseAdmin';
import { TEST_USER_FILE } from './global-setup';

// Deletes the disposable test account created in global-setup.ts, cascading
// (per webapp/supabase/schema.sql's `on delete cascade`) to its profiles row —
// so the next run starts clean against the same E2E_TEST_EMAIL identity.
export default async function globalTeardown() {
  if (!isSupabaseAdminConfigured()) return;
  if (!fs.existsSync(TEST_USER_FILE)) return;

  const { id } = JSON.parse(fs.readFileSync(TEST_USER_FILE, 'utf-8'));
  await deleteTestUser(id);
  fs.rmSync(TEST_USER_FILE, { force: true });
}
