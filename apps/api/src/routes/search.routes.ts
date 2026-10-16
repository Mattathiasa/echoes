import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { entries, entryEmbeddings, cosineDistance } from "../db/schema.js";
import { embed } from "../lib/embeddings.js";

const searchSchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(20).default(5),
});

export async function searchRoutes(app: FastifyInstance) {
  app.post("/search", { preHandler: [app.authenticate] }, async (req) => {
    const { query, limit } = searchSchema.parse(req.body);

    const queryEmbedding = await embed(query);

    const rows = await db
      .select({
        id: entries.id,
        transcript: entries.transcript,
        durationSecs: entries.durationSecs,
        createdAt: entries.createdAt,
        audioPath: entries.audioPath,
        score: sql<number>`1 - (${cosineDistance(entryEmbeddings.embedding, queryEmbedding)})`.as("score"),
      })
      .from(entryEmbeddings)
      .innerJoin(entries, eq(entryEmbeddings.entryId, entries.id))
      .where(eq(entryEmbeddings.userId, req.userId))
      .orderBy(sql`score desc`)
      .limit(limit);

    return rows;
  });
}
