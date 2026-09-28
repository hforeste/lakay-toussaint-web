import postgres from "postgres";

export class DatabaseConfigurationError extends Error {
  constructor() {
    super("DATABASE_URL is not configured.");
    this.name = "DatabaseConfigurationError";
  }
}

let client: ReturnType<typeof postgres> | undefined;

export function getDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new DatabaseConfigurationError();
  }

  if (!client) {
    const isLocal = /(?:localhost|127\.0\.0\.1)/.test(connectionString);

    client = postgres(connectionString, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
      ssl: isLocal ? false : "require",
    });
  }

  return client;
}
