import type { FastifyInstance } from "fastify";
import { join, resolve } from "path";
import { access } from "fs/promises";
import { env } from "../env.js";

export async function audioRoutes(app: FastifyInstance) {
  app.get(
    "/audio/:userId/:filename",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const { userId, filename } = req.params as { userId: string; filename: string };

      if (userId !== req.userId) {
        return reply.code(403).send({ error: "forbidden" });
      }

      if (!/^[\w-]+\.webm$/.test(filename)) {
        return reply.code(400).send({ error: "invalid filename" });
      }

      const filePath = resolve(join(env.UPLOADS_DIR, userId, filename));
      const uploadsBase = resolve(env.UPLOADS_DIR);
      if (!filePath.startsWith(uploadsBase)) {
        return reply.code(400).send({ error: "invalid path" });
      }

      try {
        await access(filePath);
      } catch {
        return reply.code(404).send({ error: "not_found" });
      }

      return reply.sendFile(join(userId, filename), resolve(env.UPLOADS_DIR));
    },
  );
}
