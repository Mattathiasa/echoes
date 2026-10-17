import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatDate(iso: string, includeTime = false): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const datePart = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  if (includeTime) {
    if (diffDays === 0) return `Today at ${time}`;
    if (diffDays === 1) return `Yesterday at ${time}`;
    return `${datePart} at ${time}`;
  }
  return datePart;
}
