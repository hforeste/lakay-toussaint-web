import postgres from "postgres";
import { beforeEach, describe, expect, it } from "vitest";
import {
  cancelEventRegistration,
  createEventRegistration,
  deleteExpiredRegistrationData,
  DuplicateRegistrationError,
  RegistrationCapacityError,
  RegistrationClosedError,
  RegistrationRateLimitError,
} from "@/lib/events/repository";
import { encryptPersonalData, personalDataLookupHash } from "@/lib/privacy";
import { insertTestEvent, resetTestData, TEST_DATABASE_URL } from "../support/test-database";

const registration = (email = "marie@example.com", attendeeCount = 2) => ({
  firstName: "Marie",
  lastName: "Toussaint",
  email,
  phone: "+1 206 555 0100",
  attendeeCount,
  whatsappPhone: "",
  whatsappOptIn: false,
});

beforeEach(async () => {
  await resetTestData();
});

describe("public registration persistence", () => {
  it("creates an encrypted registration and updates attendance", async () => {
    const event = await insertTestEvent();
    const result = await createEventRegistration({
      slug: event.slug,
      input: registration(),
      ipAddress: "192.0.2.1",
    });

    const sql = postgres(TEST_DATABASE_URL, { max: 1 });
    const rows = await sql<{
      first_name_encrypted: Uint8Array;
      email_encrypted: Uint8Array;
      registered_attendees: number;
    }[]>`
      SELECT r.first_name_encrypted, r.email_encrypted, e.registered_attendees
      FROM event_registrations r JOIN events e ON e.id = r.event_id
      WHERE r.id = ${result.registrationId}
    `;
    await sql.end();

    expect(rows[0].registered_attendees).toBe(2);
    expect(Buffer.from(rows[0].first_name_encrypted).toString("utf8")).not.toContain("Marie");
    expect(Buffer.from(rows[0].email_encrypted).toString("utf8")).not.toContain("marie@example.com");
    expect(result.cancellationToken.length).toBeGreaterThan(30);
  });

  it("rejects a duplicate active email", async () => {
    const event = await insertTestEvent();
    await createEventRegistration({ slug: event.slug, input: registration(), ipAddress: "192.0.2.2" });

    await expect(createEventRegistration({
      slug: event.slug,
      input: registration("MARIE@example.com"),
      ipAddress: "192.0.2.3",
    })).rejects.toBeInstanceOf(DuplicateRegistrationError);
  });

  it("never exceeds capacity under concurrent registrations", async () => {
    const event = await insertTestEvent({ capacity: 5 });
    const attempts = await Promise.allSettled([
      createEventRegistration({ slug: event.slug, input: registration("one@example.com", 3), ipAddress: "192.0.2.4" }),
      createEventRegistration({ slug: event.slug, input: registration("two@example.com", 3), ipAddress: "192.0.2.5" }),
    ]);

    expect(attempts.filter((attempt) => attempt.status === "fulfilled")).toHaveLength(1);
    const rejection = attempts.find((attempt) => attempt.status === "rejected") as PromiseRejectedResult;
    expect(rejection.reason).toBeInstanceOf(RegistrationCapacityError);

    const sql = postgres(TEST_DATABASE_URL, { max: 1 });
    const rows = await sql<{ registered_attendees: number }[]>`
      SELECT registered_attendees FROM events WHERE id = ${event.id}
    `;
    await sql.end();
    expect(rows[0].registered_attendees).toBe(3);
  });

  it("enforces closed registration windows", async () => {
    const event = await insertTestEvent({ registrationClosesAt: new Date("2020-01-02T00:00:00.000Z") });
    await expect(createEventRegistration({
      slug: event.slug,
      input: registration(),
      ipAddress: "192.0.2.6",
    })).rejects.toBeInstanceOf(RegistrationClosedError);
  });

  it("rate limits repeated attempts from one IP", async () => {
    const event = await insertTestEvent({ capacity: null });
    for (let index = 0; index < 10; index += 1) {
      await createEventRegistration({
        slug: event.slug,
        input: registration(`person-${index}@example.com`, 1),
        ipAddress: "192.0.2.7",
      });
    }

    await expect(createEventRegistration({
      slug: event.slug,
      input: registration("blocked@example.com", 1),
      ipAddress: "192.0.2.7",
    })).rejects.toBeInstanceOf(RegistrationRateLimitError);
  });

  it("cancels once and releases all reserved spaces", async () => {
    const event = await insertTestEvent();
    const created = await createEventRegistration({
      slug: event.slug,
      input: registration(),
      ipAddress: "192.0.2.8",
    });

    const cancelled = await cancelEventRegistration(event.slug, created.cancellationToken);
    const repeated = await cancelEventRegistration(event.slug, created.cancellationToken);
    expect(cancelled?.attendeeCount).toBe(2);
    expect(repeated).toBeNull();

    const sql = postgres(TEST_DATABASE_URL, { max: 1 });
    const events = await sql<{ registered_attendees: number }[]>`
      SELECT registered_attendees FROM events WHERE id = ${event.id}
    `;
    await sql.end();
    expect(events[0].registered_attendees).toBe(0);
  });

  it("deletes personal data 90 days after an event", async () => {
    const event = await insertTestEvent({
      slug: "expired-event",
      startsAt: new Date("2020-01-01T18:00:00.000Z"),
      endsAt: new Date("2020-01-01T20:00:00.000Z"),
      registrationClosesAt: new Date("2020-01-01T17:00:00.000Z"),
    });
    const sql = postgres(TEST_DATABASE_URL, { max: 1 });
    await sql`
      INSERT INTO event_registrations (
        event_id, first_name_encrypted, email_encrypted, email_lookup_hash, attendee_count
      ) VALUES (
        ${event.id}, ${encryptPersonalData("Old")}, ${encryptPersonalData("old@example.com")},
        ${personalDataLookupHash("old@example.com")}, 1
      )
    `;
    await sql.end();

    expect(await deleteExpiredRegistrationData()).toBe(1);
  });
});
