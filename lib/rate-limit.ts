import { prisma } from '@/lib/prisma';

/** An atomic, database-backed one-hour window shared across serverless instances. */
export async function consumeRoastQuota(userId: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "RoastQuota" ("userId", "windowStart", "count")
    VALUES (${userId}, NOW(), 1)
    ON CONFLICT ("userId") DO UPDATE SET
      "windowStart" = CASE
        WHEN "RoastQuota"."windowStart" <= NOW() - INTERVAL '1 hour' THEN NOW()
        ELSE "RoastQuota"."windowStart"
      END,
      "count" = CASE
        WHEN "RoastQuota"."windowStart" <= NOW() - INTERVAL '1 hour' THEN 1
        ELSE "RoastQuota"."count" + 1
      END
    WHERE "RoastQuota"."windowStart" <= NOW() - INTERVAL '1 hour'
       OR "RoastQuota"."count" < 5
    RETURNING "count"
  `;
  return rows.length > 0;
}
