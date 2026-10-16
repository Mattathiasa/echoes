import type { FastifyInstance } from "fastify";
import { sql, eq, gte, and, desc, lte } from "drizzle-orm";
import { db } from "../db/client.js";
import { entries } from "../db/schema.js";

function currentWeekStart(): Date {
  const now = new Date();
  const day = now.getUTCDay();
  const daysToMon = day === 0 ? 6 : day - 1;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysToMon));
}

export async function statsRoutes(app: FastifyInstance) {
  app.get("/stats", { preHandler: [app.authenticate] }, async (req) => {
    const userId = req.userId;

    const [totals] = await db
      .select({
        count: sql<number>`count(*)::int`,
        totalDuration: sql<number>`coalesce(sum(${entries.durationSecs}), 0)::int`,
      })
      .from(entries)
      .where(eq(entries.userId, userId));

    const weekStart = currentWeekStart();
    const [weekRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(entries)
      .where(and(eq(entries.userId, userId), gte(entries.createdAt, weekStart)));

    // Distinct recording days ordered descending, for streak calculation
    const days = await db
      .selectDistinct({
        day: sql<string>`(${entries.createdAt} AT TIME ZONE 'UTC')::date::text`,
      })
      .from(entries)
      .where(eq(entries.userId, userId))
      .orderBy(desc(sql`(${entries.createdAt} AT TIME ZONE 'UTC')::date`));

    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterdayStr = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

    // Streak: consecutive days ending today or yesterday
    let streakDays = 0;
    const mostRecentDay = days[0];
    if (mostRecentDay && (mostRecentDay.day === todayStr || mostRecentDay.day === yesterdayStr)) {
      let expected = mostRecentDay.day;
      for (const { day } of days) {
        if (day === expected) {
          streakDays++;
          const d = new Date(expected + "T00:00:00Z");
          d.setUTCDate(d.getUTCDate() - 1);
          expected = d.toISOString().slice(0, 10);
        } else {
          break;
        }
      }
    }

    return {
      totalEntries: totals?.count ?? 0,
      totalDurationSecs: totals?.totalDuration ?? 0,
      weekEntries: weekRow?.count ?? 0,
      streakDays,
    };
  });

  app.get("/stats/activity", { preHandler: [app.authenticate] }, async (req) => {
    const since = new Date(Date.now() - 16 * 7 * 86_400_000);

    const rows = await db
      .select({
        date: sql<string>`(${entries.createdAt} AT TIME ZONE 'UTC')::date::text`,
        count: sql<number>`count(*)::int`,
      })
      .from(entries)
      .where(and(eq(entries.userId, req.userId), gte(entries.createdAt, since)))
      .groupBy(sql`(${entries.createdAt} AT TIME ZONE 'UTC')::date`)
      .orderBy(sql`(${entries.createdAt} AT TIME ZONE 'UTC')::date`);

    return rows;
  });
}
