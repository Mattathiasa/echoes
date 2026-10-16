import type { FastifyInstance } from "fastify";
import { and, eq, gte, lte, desc } from "drizzle-orm";
import { db } from "../db/client.js";
import { entries } from "../db/schema.js";
import type { Entry } from "../db/schema.js";

interface FlashWindow {
  label: string;
  daysAgo: number;
  toleranceDays: number;
}

const WINDOWS: FlashWindow[] = [
  { label: "1 week ago", daysAgo: 7, toleranceDays: 1 },
  { label: "1 month ago", daysAgo: 30, toleranceDays: 3 },
  { label: "1 year ago", daysAgo: 365, toleranceDays: 7 },
];

export async function memoriesRoutes(app: FastifyInstance) {
  app.get("/memories/flash", { preHandler: [app.authenticate] }, async (req) => {
    const now = Date.now();
    const flashes: { label: string; entry: Entry }[] = [];

    for (const w of WINDOWS) {
      const center = now - w.daysAgo * 86_400_000;
      const from = new Date(center - w.toleranceDays * 86_400_000);
      const to = new Date(center + w.toleranceDays * 86_400_000);

      const entry = await db.query.entries.findFirst({
        where: and(
          eq(entries.userId, req.userId),
          gte(entries.createdAt, from),
          lte(entries.createdAt, to),
        ),
        orderBy: [desc(entries.createdAt)],
      });

      if (entry) flashes.push({ label: w.label, entry });
    }

    return flashes;
  });
}
