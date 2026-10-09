import { getDatabase } from "@/lib/database";
import {
  cancellationTokenHash,
  decryptPersonalData,
  encryptPersonalData,
  generateCancellationToken,
  normalizedEmail,
  personalDataLookupHash,
} from "@/lib/privacy";
import type { EventScheduleStatus, PublicEvent, RegistrationInput } from "./types";

interface EventRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  schedule_status: EventScheduleStatus;
  event_date: string | null;
  starts_at: Date | null;
  ends_at: Date | null;
  time_zone: string;
  location_name: string | null;
  location_address: string | null;
  summary: string;
  description: string;
  hero_image_url: string | null;
  capacity: number | null;
  registered_attendees: number;
  registration_opens_at: Date | null;
  registration_closes_at: Date | null;
  max_party_size: number;
  status: string;
}

interface RegistrationRow {
  id: string;
  first_name_encrypted: Uint8Array;
  email_encrypted: Uint8Array;
  attendee_count: number;
  event_title: string;
  event_slug: string;
  event_starts_at: Date | null;
  event_time_zone: string;
}

export class RegistrationClosedError extends Error {}
export class RegistrationCapacityError extends Error {}
export class DuplicateRegistrationError extends Error {}
export class RegistrationRateLimitError extends Error {}

function mapEvent(row: EventRow): PublicEvent {
  const now = Date.now();
  const opensAt = row.registration_opens_at?.getTime() ?? Number.NEGATIVE_INFINITY;
  const closesAt = row.registration_closes_at?.getTime() ?? row.starts_at?.getTime() ?? Number.NEGATIVE_INFINITY;
  const hasCapacity =
    row.capacity === null || row.registered_attendees < row.capacity;
  const currentDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: row.time_zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date()).reduce((parts, part) => ({ ...parts, [part.type]: part.value }), {} as Record<string, string>);
  const today = `${currentDate.year}-${currentDate.month}-${currentDate.day}`;
  const hasEnded = row.schedule_status === "date_only"
    ? Boolean(row.event_date && row.event_date < today)
    : row.starts_at !== null && (row.ends_at ?? row.starts_at).getTime() < now;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    scheduleStatus: row.schedule_status,
    eventDate: row.event_date,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    timeZone: row.time_zone,
    locationName: row.location_name,
    locationAddress: row.location_address,
    summary: row.summary,
    description: row.description,
    heroImageUrl: row.hero_image_url,
    capacity: row.capacity,
    registeredAttendees: row.registered_attendees,
    registrationOpensAt: row.registration_opens_at,
    registrationClosesAt: row.registration_closes_at,
    maxPartySize: row.max_party_size,
    registrationAvailable:
      row.status === "published" && row.schedule_status === "scheduled" && row.starts_at !== null && !hasEnded && now >= opensAt && now <= closesAt && hasCapacity,
    hasEnded,
  };
}

const eventColumns = `
  id, slug, title, subtitle, schedule_status, event_date, starts_at, ends_at, time_zone,
  location_name, location_address, summary, description, hero_image_url,
  capacity, registered_attendees, registration_opens_at,
  registration_closes_at, max_party_size, status
`;

export async function getPublishedEvents() {
  const sql = getDatabase();
  const rows = await sql.unsafe<EventRow[]>(`
    SELECT ${eventColumns}
    FROM events
    WHERE status = 'published'
    ORDER BY COALESCE(starts_at, event_date::timestamp) DESC NULLS FIRST, display_order ASC
  `);

  const events = rows.map(mapEvent);
  const sortTime = (event: PublicEvent) => {
    if (event.startsAt) return event.startsAt.getTime();
    if (event.eventDate) return Date.parse(`${event.eventDate}T00:00:00.000Z`);
    return Number.NEGATIVE_INFINITY;
  };
  return {
    upcoming: events.filter((event) => !event.hasEnded).sort((a, b) => sortTime(a) - sortTime(b)),
    past: events.filter((event) => event.hasEnded).sort((a, b) => sortTime(b) - sortTime(a)),
  };
}

export async function getPublishedEventBySlug(slug: string) {
  const sql = getDatabase();
  const rows = await sql.unsafe<EventRow[]>(
    `SELECT ${eventColumns} FROM events WHERE slug = $1 AND status = 'published' LIMIT 1`,
    [slug],
  );

  return rows[0] ? mapEvent(rows[0]) : null;
}

async function consumeRateLimit(
  sql: ReturnType<typeof getDatabase>,
  scope: string,
  key: string,
  limit: number,
) {
  const keyHash = personalDataLookupHash(key);
  const rows = await sql<{ request_count: number }[]>`
    INSERT INTO registration_rate_limits (scope, key_hash, window_started_at, request_count)
    VALUES (${scope}, ${keyHash}, now(), 1)
    ON CONFLICT (scope, key_hash) DO UPDATE SET
      window_started_at = CASE
        WHEN registration_rate_limits.window_started_at < now() - interval '15 minutes'
          THEN now()
        ELSE registration_rate_limits.window_started_at
      END,
      request_count = CASE
        WHEN registration_rate_limits.window_started_at < now() - interval '15 minutes'
          THEN 1
        ELSE registration_rate_limits.request_count + 1
      END
    RETURNING request_count
  `;

  if (rows[0].request_count > limit) {
    throw new RegistrationRateLimitError();
  }
}

export async function createEventRegistration({
  slug,
  input,
  ipAddress,
}: {
  slug: string;
  input: RegistrationInput;
  ipAddress: string;
}) {
  const sql = getDatabase();
  const email = normalizedEmail(input.email);
  const emailHash = personalDataLookupHash(email);
  const rawCancellationToken = generateCancellationToken();
  const tokenHash = cancellationTokenHash(rawCancellationToken);
  const eventIds = await sql<{ id: string }[]>`
    SELECT id FROM events WHERE slug = ${slug} AND status = 'published' LIMIT 1
  `;
  const eventId = eventIds[0]?.id;

  if (!eventId) {
    throw new RegistrationClosedError();
  }

  // Keep abuse counters outside the registration transaction so rejected
  // duplicate or capacity attempts cannot roll their increments back.
  await consumeRateLimit(sql, `registration-ip:${eventId}`, ipAddress, 10);
  await consumeRateLimit(sql, `registration-email:${eventId}`, email, 3);

  const result = await sql.begin(async (tx) => {
    const events = await tx<EventRow[]>`
      SELECT id, slug, title, subtitle, schedule_status, event_date, starts_at, ends_at, time_zone,
        location_name, location_address, summary, description, hero_image_url,
        capacity, registered_attendees, registration_opens_at,
        registration_closes_at, max_party_size, status
      FROM events
      WHERE slug = ${slug} AND status = 'published'
      FOR UPDATE
    `;
    const event = events[0];

    if (!event || !mapEvent(event).registrationAvailable) {
      throw new RegistrationClosedError();
    }

    if (input.attendeeCount > event.max_party_size) {
      throw new RegistrationCapacityError();
    }

    const duplicates = await tx<{ exists: boolean }[]>`
      SELECT EXISTS(
        SELECT 1 FROM event_registrations
        WHERE event_id = ${event.id}
          AND email_lookup_hash = ${emailHash}
          AND status = 'confirmed'
      ) AS exists
    `;

    if (duplicates[0].exists) {
      throw new DuplicateRegistrationError();
    }

    const capacity = await tx<{ id: string }[]>`
      UPDATE events
      SET registered_attendees = registered_attendees + ${input.attendeeCount},
          updated_at = now()
      WHERE id = ${event.id}
        AND (capacity IS NULL OR registered_attendees + ${input.attendeeCount} <= capacity)
      RETURNING id
    `;

    if (!capacity.length) {
      throw new RegistrationCapacityError();
    }

    const registrations = await tx<{ id: string }[]>`
      INSERT INTO event_registrations (
        event_id, first_name_encrypted, last_name_encrypted, email_encrypted,
        email_lookup_hash, attendee_count, phone_encrypted, whatsapp_phone_encrypted,
        whatsapp_opt_in, cancellation_token_hash, date_of_birth_encrypted,
        gender_encrypted, city_encrypted, county_encrypted, attendance_mode,
        accommodations_encrypted, media_acknowledgement
      ) VALUES (
        ${event.id},
        ${encryptPersonalData(input.firstName)},
        ${input.lastName ? encryptPersonalData(input.lastName) : null},
        ${encryptPersonalData(email)},
        ${emailHash},
        ${input.attendeeCount},
        ${input.phone ? encryptPersonalData(input.phone) : null},
        ${input.whatsappPhone ? encryptPersonalData(input.whatsappPhone) : null},
        ${input.whatsappOptIn},
        ${tokenHash},
        ${input.dateOfBirth ? encryptPersonalData(input.dateOfBirth) : null},
        ${input.gender ? encryptPersonalData(input.gender) : null},
        ${input.city ? encryptPersonalData(input.city) : null},
        ${input.county ? encryptPersonalData(input.county) : null},
        ${input.attendanceMode ?? null},
        ${input.accommodations ? encryptPersonalData(input.accommodations) : null},
        ${input.mediaAcknowledgement ?? null}
      )
      RETURNING id
    `;

    return { event, registrationId: registrations[0].id };
  });

  return {
    registrationId: result.registrationId,
    cancellationToken: rawCancellationToken,
    email,
    firstName: input.firstName,
    attendeeCount: input.attendeeCount,
    event: mapEvent(result.event),
  };
}

export async function getCancellationDetails(slug: string, token: string) {
  if (!token || token.length > 200) {
    return null;
  }

  const sql = getDatabase();
  const rows = await sql<{
    event_title: string;
    event_starts_at: Date | null;
    event_time_zone: string;
  }[]>`
    SELECT e.title AS event_title, e.starts_at AS event_starts_at,
      e.time_zone AS event_time_zone
    FROM event_registrations r
    JOIN events e ON e.id = r.event_id
    WHERE e.slug = ${slug}
      AND r.cancellation_token_hash = ${cancellationTokenHash(token)}
      AND r.status = 'confirmed'
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function cancelEventRegistration(slug: string, token: string) {
  if (!token || token.length > 200) {
    return null;
  }

  const sql = getDatabase();
  return sql.begin(async (tx) => {
    const rows = await tx<RegistrationRow[]>`
      SELECT r.id, r.first_name_encrypted, r.email_encrypted, r.attendee_count,
        e.title AS event_title, e.slug AS event_slug,
        e.starts_at AS event_starts_at, e.time_zone AS event_time_zone
      FROM event_registrations r
      JOIN events e ON e.id = r.event_id
      WHERE e.slug = ${slug}
        AND r.cancellation_token_hash = ${cancellationTokenHash(token)}
        AND r.status = 'confirmed'
      FOR UPDATE OF r, e
    `;
    const registration = rows[0];

    if (!registration) {
      return null;
    }

    await tx`
      UPDATE event_registrations
      SET status = 'cancelled', cancelled_at = now(),
        cancellation_token_hash = NULL, updated_at = now()
      WHERE id = ${registration.id}
    `;
    await tx`
      UPDATE events
      SET registered_attendees = GREATEST(0, registered_attendees - ${registration.attendee_count}),
        updated_at = now()
      WHERE slug = ${slug}
    `;

    return {
      registrationId: registration.id,
      firstName: decryptPersonalData(registration.first_name_encrypted),
      email: decryptPersonalData(registration.email_encrypted),
      attendeeCount: registration.attendee_count,
      eventTitle: registration.event_title,
      eventSlug: registration.event_slug,
      eventStartsAt: registration.event_starts_at,
      eventTimeZone: registration.event_time_zone,
    };
  });
}

export async function deleteExpiredRegistrationData() {
  const sql = getDatabase();
  const deleted = await sql<{ id: string }[]>`
    DELETE FROM event_registrations r
    USING events e
    WHERE r.event_id = e.id
      AND COALESCE(e.ends_at, e.starts_at) < now() - interval '90 days'
    RETURNING r.id
  `;

  await sql`
    DELETE FROM registration_rate_limits
    WHERE window_started_at < now() - interval '2 days'
  `;

  return deleted.length;
}
