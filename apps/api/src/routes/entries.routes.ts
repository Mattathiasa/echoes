import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { mkdir, unlink } from "fs/promises";
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

async function saveUpload(
  stream: NodeJS.ReadableStream,
  destPath: string,
): Promise<void> {
  const { pipeline } = await import("stream/promises");
  const { createWriteStream } = await import("fs");
  await pipeline(stream, createWriteStream(destPath));
}

export async function entriesRoutes(app: FastifyInstance) {
  // Transcribe audio without saving — returns transcript for preview
  app.post("/entries/transcribe", { preHandler: [app.authenticate] }, async (req, reply) => {
    const data = await req.file();
    if (!data) return reply.code(400).send({ error: "audio file required" });

    const tmpDir = join(env.UPLOADS_DIR, "_tmp");
    await mkdir(tmpDir, { recursive: true });
    const tmpPath = join(tmpDir, `${randomUUID()}.webm`);
    await saveUpload(data.file, tmpPath);

    try {
      const transcript = await transcribeAudio(tmpPath);
      return { transcript };
    } finally {
      await unlink(tmpPath).catch(() => {});
    }
  });

  app.post("/entries", { preHandler: [app.authenticate] }, async (req, reply) => {
    const data = await req.file();
    if (!data) return reply.code(400).send({ error: "audio file required" });

    const durationSecs = parseInt(req.headers["x-duration-secs"] as string ?? "0", 10) || 0;
    // Optional pre-computed transcript from the preview step (skips Whisper call)
    const providedTranscript = req.headers["x-transcript"] as string | undefined;

    const userDir = join(env.UPLOADS_DIR, req.userId);
    await mkdir(userDir, { recursive: true });

    const filename = `${randomUUID()}.webm`;
    const audioPath = join(userDir, filename);

    await saveUpload(data.file, audioPath);

    const transcript = providedTranscript?.trim() || await transcribeAudio(audioPath);
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

  // Must be registered before /entries/:id so the static segment wins
  app.get("/entries/random", { preHandler: [app.authenticate] }, async (req, reply) => {
    const [entry] = await db
      .select()
      .from(entries)
      .where(eq(entries.userId, req.userId))
      .orderBy(sql`random()`)
      .limit(1);
    if (!entry) return reply.code(404).send({ error: "no_entries" });
    return entry;
  });

  app.get("/entries/:id", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };

    const entry = await db.query.entries.findFirst({
      where: and(eq(entries.id, id), eq(entries.userId, req.userId)),
    });

    if (!entry) return reply.code(404).send({ error: "not_found" });
    return entry;
  });

  app.patch("/entries/:id", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = z
      .object({
        transcript: z.string().min(1).optional(),
        tags: z.array(z.string().max(30)).max(5).optional(),
      })
      .refine((b) => b.transcript !== undefined || b.tags !== undefined, {
        message: "at least one field required",
      })
      .parse(req.body);

    const existing = await db.query.entries.findFirst({
      where: and(eq(entries.id, id), eq(entries.userId, req.userId)),
    });
    if (!existing) return reply.code(404).send({ error: "not_found" });

    const patch: { transcript?: string; tags?: string[] } = {};
    if (body.tags !== undefined) patch.tags = body.tags;

    if (body.transcript !== undefined) {
      patch.transcript = body.transcript;
      const embedding = await embed(body.transcript);
      await db
        .update(entryEmbeddings)
        .set({ embedding })
        .where(eq(entryEmbeddings.entryId, id));
    }

    const [updated] = await db
      .update(entries)
      .set(patch)
      .where(and(eq(entries.id, id), eq(entries.userId, req.userId)))
      .returning();

    return updated;
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
