import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import { env } from "../env.js";

async function main() {
  const client = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector`);
  await migrate(db, { migrationsFolder: "./drizzle" });

  await client.end();
  console.log("[echoes] migrations applied ✔");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
