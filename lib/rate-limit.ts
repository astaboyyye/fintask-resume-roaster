import { claimRoastAttempt, isDatabaseConfigured } from '@/lib/db';

const WINDOW_SECONDS = 60 * 60;

export function roastLimitPerHour(): number {
  const configured = Number.parseInt(process.env.ROAST_LIMIT_PER_HOUR ?? '', 10);
  return Number.isFinite(configured) && configured > 0 ? configured : 5;
}

// Fallback for local development without Supabase. It is per server instance only,
// so production deployments should configure Supabase for a shared, atomic limit.
const memory = new Map<string, number[]>();

function claimInMemory(userId: string, limit: number) {
  const now = Date.now();
  const recent = (memory.get(userId) ?? []).filter((time) => now - time < WINDOW_SECONDS * 1000);
  if (recent.length >= limit) {
    memory.set(userId, recent);
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + WINDOW_SECONDS * 1000 - now) / 1000)) };
  }
  recent.push(now);
  memory.set(userId, recent);
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Records one roast attempt for this user and says whether it is within the hourly limit. */
export async function claimRoast(userId: string) {
  const limit = roastLimitPerHour();
  return isDatabaseConfigured() ? claimRoastAttempt(userId, limit, WINDOW_SECONDS) : claimInMemory(userId, limit);
}
