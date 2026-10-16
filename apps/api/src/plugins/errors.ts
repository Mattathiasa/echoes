import fp from "fastify-plugin";
import type { FastifyError } from "fastify";
import { ZodError } from "zod";

export const errorsPlugin = fp(async (app) => {
  app.setErrorHandler((err: FastifyError, req, reply) => {
    if (err instanceof ZodError) {
      return reply.code(400).send({
        error: "validation_error",
        issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
    if (typeof err.statusCode === "number" && err.statusCode < 500) {
      return reply.code(err.statusCode).send({ error: err.message });
    }
    req.log.error(err);
    return reply.code(500).send({ error: "internal_error" });
  });

  app.setNotFoundHandler((_req, reply) => {
    reply.code(404).send({ error: "not_found" });
  });
});
