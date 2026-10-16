import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import { hashPassword, verifyPassword } from "../lib/password.js";

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8, "password must be at least 8 characters"),
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (req, reply) => {
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

  app.post("/auth/login", async (req, reply) => {
    const { email, password } = credentials.parse(req.body);

    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return reply.code(401).send({ error: "invalid credentials" });
    }

    const token = app.jwt.sign({ sub: user.id });
    return { token, user: { id: user.id, email: user.email } };
  });
}
