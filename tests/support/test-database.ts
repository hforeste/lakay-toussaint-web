import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import postgres from "postgres";

export const TEST_DATABASE_URL = "postgres://lakay:local-development-only@127.0.0.1:54329/lakay_toussaint_test";
const maintenanceUrl = "postgres://lakay:local-development-only@127.0.0.1:54329/postgres";

export async function initializeTestDatabase() {
  const maintenance = postgres(maintenanceUrl, { max: 1 });
  try {
    const existing = await maintenance<{ exists: boolean }[]>`
      SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = 'lakay_toussaint_test') AS exists
    `;
    if (!existing[0]?.exists) {
      await maintenance.unsafe("CREATE DATABASE lakay_toussaint_test");
    }
  } finally {
    await maintenance.end();
  }

  const sql = postgres(TEST_DATABASE_URL, { max: 1 });
  try {
    await sql.unsafe("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;");
    const migrationDirectory = resolve(process.cwd(), "db/migrations");
    const migrations = (await readdir(migrationDirectory))
      .filter((file) => file.endsWith(".sql"))
      .sort();
    for (const migration of migrations) {
      await sql.unsafe(await readFile(resolve(migrationDirectory, migration), "utf8"));
    }
  } finally {
    await sql.end();
  }
}

export async function resetTestData() {
  const sql = postgres(TEST_DATABASE_URL, { max: 1 });
  try {
    await sql`TRUNCATE registration_rate_limits, event_registrations, events RESTART IDENTITY CASCADE`;
  } finally {
    await sql.end();
  }
}

export async function insertTestEvent(overrides: {
  slug?: string;
  capacity?: number | null;
  maxPartySize?: number;
  status?: "draft" | "published" | "cancelled" | "completed";
  startsAt?: Date;
  endsAt?: Date;
  registrationOpensAt?: Date | null;
  registrationClosesAt?: Date | null;
} = {}) {
  const sql = postgres(TEST_DATABASE_URL, { max: 1 });
  const startsAt = overrides.startsAt ?? new Date("2099-06-15T18:00:00.000Z");
  const endsAt = overrides.endsAt ?? new Date("2099-06-15T21:00:00.000Z");
  const rows = await sql<{ id: string; slug: string }[]>`
    INSERT INTO events (
      slug, title, starts_at, ends_at, time_zone, location_name, location_address,
      summary, description, capacity, registration_opens_at, registration_closes_at,
      max_party_size, status
    ) VALUES (
      ${overrides.slug ?? "registration-test-event"}, 'Registration Test Event',
      ${startsAt}, ${endsAt}, 'America/Los_Angeles', 'Test Community Center',
      '100 Test Ave, Seattle, WA', 'A test event.', 'A test event used by automated tests.',
      ${overrides.capacity === undefined ? 10 : overrides.capacity},
      ${overrides.registrationOpensAt === undefined ? new Date("2020-01-01T00:00:00.000Z") : overrides.registrationOpensAt},
      ${overrides.registrationClosesAt === undefined ? new Date("2099-06-15T17:00:00.000Z") : overrides.registrationClosesAt},
      ${overrides.maxPartySize ?? 5}, ${overrides.status ?? "published"}
    )
    RETURNING id, slug
  `;
  await sql.end();
  return rows[0];
}
