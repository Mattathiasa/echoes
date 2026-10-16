import { describe, it, expect, vi, beforeEach } from "vitest";

describe("transcribeAudio", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("throws when GROQ_API_KEY is missing", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://x:x@localhost/x");
    vi.stubEnv("JWT_SECRET", "test_secret_at_least_16_chars");
    vi.stubEnv("GROQ_API_KEY", "");

    const { transcribeAudio } = await import("../src/lib/transcribe.js");
    await expect(transcribeAudio("/fake/path.webm")).rejects.toThrow("GROQ_API_KEY");
  });
});
