import { createReadStream } from "fs";
import { env } from "../env.js";

export async function transcribeAudio(filePath: string): Promise<string> {
  if (!env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is required for transcription");

  const form = new FormData();
  const blob = await fileToBlob(filePath);
  form.append("file", blob, "audio.webm");
  form.append("model", env.GROQ_WHISPER_MODEL);
  form.append("response_format", "json");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { authorization: `Bearer ${env.GROQ_API_KEY}` },
    body: form,
  });

  if (!res.ok) throw new Error(`Groq Whisper ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { text: string };
  return json.text.trim();
}

async function fileToBlob(filePath: string): Promise<Blob> {
  const { readFile } = await import("fs/promises");
  const buffer = await readFile(filePath);
  return new Blob([buffer], { type: "audio/webm" });
}
