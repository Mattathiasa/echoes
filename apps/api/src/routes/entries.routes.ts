import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { db } from "../db/client.js";
import { entries, entryEmbeddings } from "../db/schema.js";
import { env } from "../env.js";
import { transcribeAudio } from "../lib/transcribe.js";
import { embed } from "../lib/embeddings.js";

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function entriesRoutes(app: FastifyInstance) {
  app.post("/entries", { preHandler: [app.authenticate] }, async (req, reply) => {
    const data = await req.file();
    if (!data) return reply.code(400).send({ error: "audio file required" });

    const durationSecs = parseInt(req.headers["x-duration-secs"] as string ?? "0", 10) || 0;

    const userDir = join(env.UPLOADS_DIR, req.userId);
    await mkdir(userDir, { recursive: true });

    const filename = `${randomUUID()}.webm`;
    const audioPath = join(userDir, filename);

    const { pipeline } = await import("stream/promises");
    const { createWriteStream } = await import("fs");
    await pipeline(data.file, createWriteStream(audioPath));

    const transcript = await transcribeAudio(audioPath);
    const embedding = await embed(transcript);

    const [entry] = await db
      .insert(entries)
      .values({ userId: req.userId, audioPath, transcript, durationSecs })
      .returning();

    await db.insert(entryEmbeddings).values({
      entryId: entry!.id,
      userId: req.userId,
      embedding,
    });

    return reply.code(201).send(entry);
  });

  app.get("/entries", { preHandler: [app.authenticate] }, async (req) => {
    const { limit, offset } = paginationSchema.parse(req.query);

    const rows = await db.query.entries.findMany({
      where: eq(entries.userId, req.userId),
      orderBy: [desc(entries.createdAt)],
      limit,
      offset,
    });

    return rows;
  });

  app.get("/entries/:id", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };

    const entry = await db.query.entries.findFirst({
      where: and(eq(entries.id, id), eq(entries.userId, req.userId)),
    });

    if (!entry) return reply.code(404).send({ error: "not_found" });
    return entry;
  });

  app.delete("/entries/:id", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };

    const [deleted] = await db
      .delete(entries)
      .where(and(eq(entries.id, id), eq(entries.userId, req.userId)))
      .returning({ id: entries.id });

    if (!deleted) return reply.code(404).send({ error: "not_found" });
    return reply.code(204).send();
  });
}
