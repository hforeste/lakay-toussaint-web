import { readFile } from "node:fs/promises";
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
  const seed = await readFile(resolve("db/seed.sql"), "utf8");
  await sql.unsafe(seed);
  console.log("Seeded event data.");
} finally {
  await sql.end();
}
