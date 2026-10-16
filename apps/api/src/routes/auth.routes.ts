import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { rmdir, rm } from "fs/promises";
import { join } from "path";
import { env } from "../env.js";

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8, "password must be at least 8 characters"),
});

export async function authRoutes(app: FastifyInstance) {
  const authLimit = { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } };

  app.post("/auth/register", authLimit, async (req, reply) => {
    const { email, password } = credentials.parse(req.body);

    const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existing) return reply.code(409).send({ error: "email already registered" });

    const [user] = await db
      .insert(users)
      .values({ email, passwordHash: await hashPassword(password) })
      .returning({ id: users.id, email: users.email });

    const token = app.jwt.sign({ sub: user!.id });
    return reply.code(201).send({ token, user });
  });

  app.post("/auth/login", authLimit, async (req, reply) => {
    const { email, password } = credentials.parse(req.body);

    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return reply.code(401).send({ error: "invalid credentials" });
    }

    const token = app.jwt.sign({ sub: user.id });
    return { token, user: { id: user.id, email: user.email } };
  });

  app.patch("/auth/password", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { currentPassword, newPassword } = z
      .object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8, "password must be at least 8 characters"),
      })
      .parse(req.body);

    const user = await db.query.users.findFirst({ where: eq(users.id, req.userId) });
    if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
      return reply.code(401).send({ error: "current password is incorrect" });
    }

    await db
      .update(users)
      .set({ passwordHash: await hashPassword(newPassword) })
      .where(eq(users.id, req.userId));

    return reply.code(204).send();
  });

  app.delete("/auth/account", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { password } = z.object({ password: z.string().min(1) }).parse(req.body);

    const user = await db.query.users.findFirst({ where: eq(users.id, req.userId) });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return reply.code(401).send({ error: "password is incorrect" });
    }

    // Delete user (cascade removes entries, embeddings, digests)
    await db.delete(users).where(eq(users.id, req.userId));

    // Best-effort cleanup of uploaded audio files
    const userDir = join(env.UPLOADS_DIR, req.userId);
    await rm(userDir, { recursive: true, force: true }).catch(() => {});

    return reply.code(204).send();
  });
}
