import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../env.js";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    userId: string;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string };
    user: { sub: string };
  }
}

export const authPlugin = fp(async (app) => {
  await app.register(fastifyJwt, { secret: env.JWT_SECRET });

  app.decorate("authenticate", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const payload = (await req.jwtVerify()) as { sub: string };
      req.userId = payload.sub;
    } catch {
      await reply.code(401).send({ error: "unauthorized" });
    }
  });
});
