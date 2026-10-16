import { env } from "../env.js";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLM {
  complete(messages: ChatMessage[]): Promise<string>;
}

class GroqClient implements LLM {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async complete(messages: ChatMessage[]): Promise<string> {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, messages, temperature: 0.4 }),
    });
    if (!res.ok) throw new Error(`Groq API ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { choices: { message: { content: string } }[] };
    return json.choices[0]?.message.content ?? "";
  }
}

class OllamaClient implements LLM {
  constructor(
    private readonly baseUrl: string,
    private readonly model: string,
  ) {}

  async complete(messages: ChatMessage[]): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: this.model, messages, stream: false }),
    });
    if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { message: { content: string } };
    return json.message.content;
  }
}

export const llm: LLM =
  env.LLM_PROVIDER === "ollama"
    ? new OllamaClient(env.OLLAMA_URL, env.OLLAMA_MODEL)
    : new GroqClient(env.GROQ_API_KEY ?? "", env.GROQ_MODEL);
