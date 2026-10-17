import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().optional(),

  LLM_PROVIDER: z.enum(["groq", "ollama"]).default("groq"),

  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
  GROQ_WHISPER_MODEL: z.string().default("whisper-large-v3-turbo"),

  OLLAMA_URL: z.string().default("http://localhost:11434"),
  OLLAMA_MODEL: z.string().default("llama3.1"),

  UPLOADS_DIR: z.string().default("./uploads"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const lines = parsed.error.issues.map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`);
  console.error("Invalid environment:\n" + lines.join("\n"));
  process.exit(1);
}

export const env = parsed.data;

if (env.LLM_PROVIDER === "groq" && !env.GROQ_API_KEY) {
  console.warn(
    "[echoes] LLM_PROVIDER=groq but GROQ_API_KEY is empty — transcription and digest will fail until you set it (free key at https://console.groq.com).",
  );
}
