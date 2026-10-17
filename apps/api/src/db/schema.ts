import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  date,
  vector,
  index,
} from "drizzle-orm/pg-core";

export const EMBEDDING_DIM = 384;

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const entries = pgTable("entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  audioPath: text("audio_path").notNull(),
  transcript: text("transcript").notNull(),
  durationSecs: integer("duration_secs").notNull().default(0),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const entryEmbeddings = pgTable(
  "entry_embeddings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entryId: uuid("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    embedding: vector("embedding", { dimensions: EMBEDDING_DIM }).notNull(),
  },
  (t) => [
    index("entry_embeddings_hnsw_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
    index("entry_embeddings_user_idx").on(t.userId),
  ],
);

export const weeklyDigests = pgTable("weekly_digests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  weekStart: date("week_start").notNull(),
  summaryText: text("summary_text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Entry = typeof entries.$inferSelect;
export type EntryEmbedding = typeof entryEmbeddings.$inferSelect;
export type WeeklyDigest = typeof weeklyDigests.$inferSelect;

export const cosineDistance = (col: unknown, embedding: number[]) =>
  sql`${col} <=> ${JSON.stringify(embedding)}`;
