import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createConfirmedTestUser, deleteTestUserByEmail, isSupabaseAdminConfigured } from './fixtures/supabaseAdmin';

const here = path.dirname(fileURLToPath(import.meta.url));
export const TEST_USER_FILE = path.resolve(here, '.auth/payment-test-user.json');

// Creates one disposable, pre-confirmed, non-premium Supabase user for the whole
// run — the payment suite logs in as this user so upgrading goes through the
// `client_reference_id` path (existing user) rather than the new-account/
// magic-link path, which would need an email inbox to automate.
//
// Identity is fixed (E2E_TEST_EMAIL/E2E_TEST_PASSWORD in .dev.vars) rather than
// timestamp-generated, by request — global-teardown.ts deletes it after the run,
// and this setup also deletes-then-recreates it first in case a previous run
// crashed before teardown could clean up.
export default async function globalSetup() {
  if (!isSupabaseAdminConfigured()) {
    console.warn(
      '[e2e global-setup] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set in .dev.vars — ' +
        'the payment suite will skip itself since it needs a real logged-in test account.'
    );
    return;
  }

  const email = process.env.E2E_TEST_EMAIL || `e2e+${Date.now()}@example.com`;
  const password = process.env.E2E_TEST_PASSWORD || 'Test-Password-123!';

  await deleteTestUserByEmail(email);
  const user = await createConfirmedTestUser(email, password);

  fs.mkdirSync(path.dirname(TEST_USER_FILE), { recursive: true });
  fs.writeFileSync(TEST_USER_FILE, JSON.stringify({ id: user.id, email, password }));
}
