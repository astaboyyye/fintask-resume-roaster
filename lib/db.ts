import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { roastSchema, type RoastResult } from '@/lib/roast-schema';

// Server-only: this module uses the Supabase service role key. Never import it from a client component.

export type RoastMode = 'ai' | 'local';

export type RoastSummary = {
  id: string;
  fileName: string;
  score: number;
  mode: RoastMode;
  createdAt: string;
};

export type SavedRoast = RoastSummary & { result: RoastResult };

type AppUser = { id: string; name?: string | null; email?: string | null; image?: string | null };

type RoastRow = {
  id: string;
  file_name: string;
  score: number;
  mode: RoastMode;
  created_at: string;
  result?: unknown;
};

export class DatabaseError extends Error {}

let client: SupabaseClient | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function db(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new DatabaseError('Supabase is not configured.');
  client ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

function fail(action: string, error: { message: string }): never {
  console.error(`[db] ${action} failed:`, error.message);
  throw new DatabaseError(`Could not ${action}.`);
}

function toSummary(row: RoastRow): RoastSummary {
  return { id: row.id, fileName: row.file_name, score: row.score, mode: row.mode, createdAt: row.created_at };
}

export async function upsertUser(user: AppUser): Promise<void> {
  const { error } = await db().from('users').upsert({
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
    last_seen_at: new Date().toISOString(),
  });
  if (error) fail('save your account', error);
}

export async function claimRoastAttempt(userId: string, limit: number, windowSeconds: number) {
  const { data, error } = await db().rpc('claim_roast_attempt', { p_user_id: userId, p_limit: limit, p_window_seconds: windowSeconds });
  if (error) fail('check your roast limit', error);
  const row = (Array.isArray(data) ? data[0] : data) as { allowed?: boolean; retry_after_seconds?: number } | null;
  return { allowed: Boolean(row?.allowed), retryAfterSeconds: row?.retry_after_seconds ?? windowSeconds };
}

export async function saveRoast(input: { user: AppUser; fileName: string; resumeText: string; result: RoastResult; mode: RoastMode }): Promise<string> {
  await upsertUser(input.user);
  const { data, error } = await db()
    .from('roasts')
    .insert({
      user_id: input.user.id,
      file_name: input.fileName,
      resume_text: input.resumeText,
      result: input.result,
      score: input.result.overall_score,
      mode: input.mode,
    })
    .select('id')
    .single();
  if (error) fail('save your roast', error);
  return (data as { id: string }).id;
}

export async function listRoasts(userId: string, limit = 50): Promise<RoastSummary[]> {
  const { data, error } = await db()
    .from('roasts')
    .select('id, file_name, score, mode, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) fail('load your history', error);
  return (data as RoastRow[]).map(toSummary);
}

/** Returns the roast only when it belongs to this user. */
export async function getRoast(userId: string, id: string): Promise<SavedRoast | null> {
  if (!isUuid(id)) return null;
  const { data, error } = await db()
    .from('roasts')
    .select('id, file_name, score, mode, created_at, result')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) fail('load this roast', error);
  if (!data) return null;
  const row = data as RoastRow;
  const result = roastSchema.safeParse(row.result);
  if (!result.success) return null;
  return { ...toSummary(row), result: result.data };
}

/** Deletes the roast only when it belongs to this user. Returns false if nothing matched. */
export async function deleteRoast(userId: string, id: string): Promise<boolean> {
  if (!isUuid(id)) return false;
  const { data, error } = await db().from('roasts').delete().eq('id', id).eq('user_id', userId).select('id');
  if (error) fail('delete this roast', error);
  return (data ?? []).length > 0;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
