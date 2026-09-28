import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required.");
}

const isLocal = /(?:localhost|127\.0\.0\.1)/.test(connectionString);
const sql = postgres(connectionString, {
  max: 1,
  ssl: isLocal ? false : "require",
});

try {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  const directory = resolve("db/migrations");
  const files = (await readdir(directory)).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    const existing = await sql`SELECT 1 FROM schema_migrations WHERE name = ${file}`;
    if (existing.length) continue;

    const migration = await readFile(resolve(directory, file), "utf8");
    await sql.begin(async (transaction) => {
      await transaction.unsafe(migration);
      await transaction`INSERT INTO schema_migrations (name) VALUES (${file})`;
    });
    console.log(`Applied ${file}`);
  }
} finally {
  await sql.end();
}
