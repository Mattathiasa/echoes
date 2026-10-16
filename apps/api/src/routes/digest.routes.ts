import type { FastifyInstance } from "fastify";
import { eq, and, gte, desc } from "drizzle-orm";
import { db } from "../db/client.js";
import { entries, weeklyDigests } from "../db/schema.js";
import { llm } from "../lib/llm.js";

function weekStart(date: Date): string {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d.toISOString().slice(0, 10);
}

export async function digestRoutes(app: FastifyInstance) {
  app.get("/digest", { preHandler: [app.authenticate] }, async (req, reply) => {
    const digest = await db.query.weeklyDigests.findFirst({
      where: eq(weeklyDigests.userId, req.userId),
      orderBy: [desc(weeklyDigests.createdAt)],
    });

    if (!digest) return reply.code(404).send({ error: "no_digest_yet" });
    return digest;
  });

  app.post("/digest/generate", { preHandler: [app.authenticate] }, async (req, reply) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentEntries = await db.query.entries.findMany({
      where: and(
        eq(entries.userId, req.userId),
        gte(entries.createdAt, sevenDaysAgo),
      ),
      orderBy: [desc(entries.createdAt)],
    });

    if (recentEntries.length === 0) {
      return reply.code(422).send({ error: "no_entries_this_week" });
    }

    const transcriptBlock = recentEntries
      .map((e, i) => `Entry ${i + 1} (${e.createdAt.toISOString().slice(0, 10)}):\n${e.transcript}`)
      .join("\n\n");

    const summary = await llm.complete([
      {
        role: "system",
        content:
          "You are a thoughtful journal companion. Analyze the voice journal entries below and write a warm, insightful weekly digest (3–5 paragraphs). Identify recurring themes, emotional patterns, notable moments, and gentle observations. End with one reflective question for the week ahead. Be specific — reference actual details from the entries.",
      },
      {
        role: "user",
        content: `Here are my voice journal entries from the past week:\n\n${transcriptBlock}`,
      },
    ]);

    const thisWeekStart = weekStart(new Date());

    const [digest] = await db
      .insert(weeklyDigests)
      .values({ userId: req.userId, weekStart: thisWeekStart, summaryText: summary })
      .onConflictDoNothing()
      .returning();

    return reply.code(201).send(digest ?? { summaryText: summary, weekStart: thisWeekStart });
  });
}
