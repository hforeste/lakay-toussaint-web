import postgres from "postgres";
import { getConfig } from "./config";

let client: ReturnType<typeof postgres> | undefined;

export function getDatabase() {
  const connectionString = getConfig("DATABASE_URL");
  if (!connectionString) throw new Error("DATABASE_URL is not configured for the admin application.");

  if (!client) {
    const local = /(?:localhost|127\.0\.0\.1)/.test(connectionString);
    client = postgres(connectionString, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
      ssl: local ? false : "require",
    });
  }

  return client;
}
