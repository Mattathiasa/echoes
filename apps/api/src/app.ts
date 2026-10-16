import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import staticFiles from "@fastify/static";
import rateLimit from "@fastify/rate-limit";
import { resolve } from "path";
import { authPlugin } from "./plugins/auth.js";
import { errorsPlugin } from "./plugins/errors.js";
import { authRoutes } from "./routes/auth.routes.js";
import { entriesRoutes } from "./routes/entries.routes.js";
import { audioRoutes } from "./routes/audio.routes.js";
import { searchRoutes } from "./routes/search.routes.js";
import { digestRoutes } from "./routes/digest.routes.js";
import { statsRoutes } from "./routes/stats.routes.js";
import { exportRoutes } from "./routes/export.routes.js";
import { memoriesRoutes } from "./routes/memories.routes.js";
import { env } from "./env.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  // Global rate limit: 300 req/min per IP. Auth routes get a tighter per-route limit below.
  await app.register(rateLimit, { max: 300, timeWindow: "1 minute", keyGenerator: (req) => req.ip });
  await app.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } });
  await app.register(staticFiles, {
    root: resolve(env.UPLOADS_DIR),
    prefix: "/uploads/",
    serve: false,
  });
  await app.register(errorsPlugin);
  await app.register(authPlugin);

  app.get("/health", async () => ({ ok: true }));

  await app.register(authRoutes);
  await app.register(entriesRoutes);
  await app.register(audioRoutes);
  await app.register(searchRoutes);
  await app.register(digestRoutes);
  await app.register(statsRoutes);
  await app.register(exportRoutes);
  await app.register(memoriesRoutes);

  return app;
}
