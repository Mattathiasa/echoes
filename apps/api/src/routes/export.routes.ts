import type { FastifyInstance } from "fastify";
import { eq, desc } from "drizzle-orm";
import { db } from "../db/client.js";
import { entries } from "../db/schema.js";

export async function exportRoutes(app: FastifyInstance) {
  app.get("/export", { preHandler: [app.authenticate] }, async (req, reply) => {
    const rows = await db.query.entries.findMany({
      where: eq(entries.userId, req.userId),
      orderBy: [desc(entries.createdAt)],
    });

    const data = rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      durationSecs: r.durationSecs,
      transcript: r.transcript,
    }));

    const date = new Date().toISOString().slice(0, 10);
    reply.header("Content-Disposition", `attachment; filename="echoes-export-${date}.json"`);
    reply.header("Content-Type", "application/json");
    return reply.send(JSON.stringify(data, null, 2));
  });
}
