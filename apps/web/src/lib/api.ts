const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function getToken(): string | null {
  return localStorage.getItem("echoes_token");
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["authorization"] = `Bearer ${token}`;
  if (!(init.body instanceof FormData)) {
    headers["content-type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error ?? "request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface User {
  id: string;
  email: string;
}

export interface Entry {
  id: string;
  userId: string;
  audioPath: string;
  transcript: string;
  durationSecs: number;
  createdAt: string;
}

export interface SearchResult extends Entry {
  score: number;
}

export interface Digest {
  id: string;
  userId: string;
  weekStart: string;
  summaryText: string;
  createdAt: string;
}

export interface Stats {
  totalEntries: number;
  totalDurationSecs: number;
  weekEntries: number;
  streakDays: number;
}

export const api = {
  auth: {
    register: (email: string, password: string) =>
      request<{ token: string; user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    login: (email: string, password: string) =>
      request<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    changePassword: (currentPassword: string, newPassword: string) =>
      request<void>("/auth/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    deleteAccount: (password: string) =>
      request<void>("/auth/account", {
        method: "DELETE",
        body: JSON.stringify({ password }),
      }),
  },
  entries: {
    transcribe: (audioBlob: Blob) => {
      const form = new FormData();
      form.append("file", audioBlob, "audio.webm");
      return request<{ transcript: string }>("/entries/transcribe", {
        method: "POST",
        body: form,
      });
    },
    create: (audioBlob: Blob, durationSecs: number, transcript?: string) => {
      const form = new FormData();
      form.append("file", audioBlob, "audio.webm");
      return request<Entry>("/entries", {
        method: "POST",
        headers: {
          "x-duration-secs": String(durationSecs),
          ...(transcript ? { "x-transcript": transcript } : {}),
        },
        body: form,
      });
    },
    list: (limit = 20, offset = 0) =>
      request<Entry[]>(`/entries?limit=${limit}&offset=${offset}`),
    get: (id: string) => request<Entry>(`/entries/${id}`),
    update: (id: string, transcript: string) =>
      request<Entry>(`/entries/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ transcript }),
      }),
    delete: (id: string) => request<void>(`/entries/${id}`, { method: "DELETE" }),
  },
  audio: {
    url: (userId: string, audioPath: string): string => {
      const filename = audioPath.split(/[\\/]/).pop() ?? "";
      return `${BASE_URL}/audio/${userId}/${filename}`;
    },
  },
  search: {
    query: (query: string, limit = 5) =>
      request<SearchResult[]>("/search", {
        method: "POST",
        body: JSON.stringify({ query, limit }),
      }),
  },
  digest: {
    get: () => request<Digest>("/digest"),
    list: () => request<Digest[]>("/digests"),
    generate: () => request<Digest>("/digest/generate", { method: "POST" }),
  },
  stats: {
    get: () => request<Stats>("/stats"),
  },
};
