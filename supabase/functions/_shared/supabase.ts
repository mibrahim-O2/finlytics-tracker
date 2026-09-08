import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2';

/** Service-role client — bypasses RLS. Only used server-side in Edge Functions. */
export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );
}

/**
 * Authorize a request as either:
 *  - the single app user (valid Supabase JWT in the Authorization header), or
 *  - a trusted scheduled call (x-cron-secret header matching CRON_SECRET).
 * Returns the user id when known, or 'cron'. Throws on failure.
 */
export async function authorize(req: Request, admin: SupabaseClient): Promise<string> {
  const cronSecret = req.headers.get('x-cron-secret');
  const expected = Deno.env.get('CRON_SECRET');
  if (cronSecret && expected && cronSecret === expected) return 'cron';

  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (token) {
    const { data, error } = await admin.auth.getUser(token);
    if (!error && data.user) return data.user.id;
  }
  throw new Error('Unauthorized');
}

/** The single app user (id + email). This product has exactly one account. */
export async function getAppUser(admin: SupabaseClient): Promise<{ id: string; email: string }> {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (error || !data.users.length) throw new Error('No app user found');
  const u = data.users[0];
  return { id: u.id, email: u.email ?? '' };
}
