import { getDatabase } from "./database";
import { slugifyEventTitle } from "./slugify";

export { slugifyEventTitle } from "./slugify";

export const eventStatuses = ["draft", "published", "cancelled", "completed"] as const;
export type EventStatus = (typeof eventStatuses)[number];

export interface AdminEvent {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  startsAt: string;
  endsAt: string;
  timeZone: string;
  locationName: string;
  locationAddress: string;
  summary: string;
  description: string;
  heroImageUrl: string;
  capacity: number | null;
  registeredAttendees: number;
  registrationOpensAt: string;
  registrationClosesAt: string;
  maxPartySize: number;
  status: EventStatus;
  isFeatured: boolean;
  displayOrder: number;
}

interface EventRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  starts_at: Date;
  ends_at: Date | null;
  time_zone: string;
  location_name: string;
  location_address: string | null;
  summary: string;
  description: string;
  hero_image_url: string | null;
  capacity: number | null;
  registered_attendees: number;
  registration_opens_at: Date | null;
  registration_closes_at: Date | null;
  max_party_size: number;
  status: EventStatus;
  is_featured: boolean;
  display_order: number;
}

const columns = `id, slug, title, subtitle, starts_at, ends_at, time_zone, location_name,
  location_address, summary, description, hero_image_url, capacity, registered_attendees,
  registration_opens_at, registration_closes_at, max_party_size, status, is_featured, display_order`;

function serialize(row: EventRow): AdminEvent {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle || "",
    startsAt: row.starts_at.toISOString(),
    endsAt: row.ends_at?.toISOString() || "",
    timeZone: row.time_zone,
    locationName: row.location_name,
    locationAddress: row.location_address || "",
    summary: row.summary,
    description: row.description,
    heroImageUrl: row.hero_image_url || "",
    capacity: row.capacity,
    registeredAttendees: row.registered_attendees,
    registrationOpensAt: row.registration_opens_at?.toISOString() || "",
    registrationClosesAt: row.registration_closes_at?.toISOString() || "",
    maxPartySize: row.max_party_size,
    status: row.status,
    isFeatured: row.is_featured,
    displayOrder: row.display_order,
  };
}

export async function listEvents() {
  const sql = getDatabase();
  const rows = await sql.unsafe<EventRow[]>(`SELECT ${columns} FROM events ORDER BY starts_at DESC, display_order ASC`);
  return rows.map(serialize);
}

export async function createEvent(input: EventInput) {
  const sql = getDatabase();
  const rows = await sql<EventRow[]>`
    INSERT INTO events (
      slug, title, subtitle, starts_at, ends_at, time_zone, location_name, location_address,
      summary, description, hero_image_url, capacity, registration_opens_at,
      registration_closes_at, max_party_size, status, is_featured, display_order
    ) VALUES (
      ${input.slug}, ${input.title}, ${input.subtitle || null}, ${input.startsAt}, ${input.endsAt || null},
      ${input.timeZone}, ${input.locationName}, ${input.locationAddress || null}, ${input.summary},
      ${input.description}, ${input.heroImageUrl || null}, ${input.capacity},
      ${input.registrationOpensAt || null}, ${input.registrationClosesAt || null},
      ${input.maxPartySize}, ${input.status}, ${input.isFeatured}, ${input.displayOrder}
    ) RETURNING ${sql.unsafe(columns)}
  `;
  return serialize(rows[0]);
}

export async function updateEvent(id: string, input: EventInput) {
  const sql = getDatabase();
  const rows = await sql<EventRow[]>`
    UPDATE events SET
      slug = ${input.slug}, title = ${input.title}, subtitle = ${input.subtitle || null},
      starts_at = ${input.startsAt}, ends_at = ${input.endsAt || null}, time_zone = ${input.timeZone},
      location_name = ${input.locationName}, location_address = ${input.locationAddress || null},
      summary = ${input.summary}, description = ${input.description}, hero_image_url = ${input.heroImageUrl || null},
      capacity = ${input.capacity}, registration_opens_at = ${input.registrationOpensAt || null},
      registration_closes_at = ${input.registrationClosesAt || null}, max_party_size = ${input.maxPartySize},
      status = ${input.status}, is_featured = ${input.isFeatured}, display_order = ${input.displayOrder},
      updated_at = now()
    WHERE id = ${id}
    RETURNING ${sql.unsafe(columns)}
  `;
  return rows[0] ? serialize(rows[0]) : null;
}

export async function deleteEvent(id: string) {
  const sql = getDatabase();
  const rows = await sql<{ id: string }[]>`DELETE FROM events WHERE id = ${id} RETURNING id`;
  return Boolean(rows[0]);
}

export interface EventInput {
  slug: string;
  title: string;
  subtitle: string;
  startsAt: string;
  endsAt: string;
  timeZone: string;
  locationName: string;
  locationAddress: string;
  summary: string;
  description: string;
  heroImageUrl: string;
  capacity: number | null;
  registrationOpensAt: string;
  registrationClosesAt: string;
  maxPartySize: number;
  status: EventStatus;
  isFeatured: boolean;
  displayOrder: number;
}

export function parseEventInput(value: unknown): { data?: EventInput; error?: string } {
  if (!value || typeof value !== "object") return { error: "Event data is required." };
  const raw = value as Record<string, unknown>;
  const text = (name: string) => (typeof raw[name] === "string" ? raw[name].trim() : "");
  const required = ["title", "startsAt", "timeZone", "locationName", "summary", "description"];
  for (const field of required) if (!text(field)) return { error: `${field} is required.` };

  const slug = slugifyEventTitle(text("slug") || text("title"));
  if (!slug) return { error: "The title must contain at least one letter or number." };
  const heroImageUrl = text("heroImageUrl");
  if (heroImageUrl) {
    const isLocalImage = heroImageUrl.startsWith("/images/") && !heroImageUrl.includes("..");
    let isPublicBlob = false;
    try {
      const parsedUrl = new URL(heroImageUrl);
      isPublicBlob = parsedUrl.protocol === "https:"
        && parsedUrl.hostname.endsWith(".public.blob.vercel-storage.com");
    } catch {
      // Relative URLs are handled by the local-image check above.
    }
    if (!isLocalImage && !isPublicBlob) {
      return { error: "Hero images must use the configured public image store." };
    }
  }
  const startsAt = new Date(text("startsAt"));
  const endsAt = text("endsAt") ? new Date(text("endsAt")) : null;
  const opensAt = text("registrationOpensAt") ? new Date(text("registrationOpensAt")) : null;
  const closesAt = text("registrationClosesAt") ? new Date(text("registrationClosesAt")) : null;
  if (Number.isNaN(startsAt.getTime())) return { error: "A valid start date is required." };
  if (endsAt && (Number.isNaN(endsAt.getTime()) || endsAt <= startsAt)) return { error: "End time must be after the start time." };
  if (closesAt && (Number.isNaN(closesAt.getTime()) || closesAt >= startsAt)) return { error: "Registration must close before the event starts." };
  if (opensAt && Number.isNaN(opensAt.getTime())) return { error: "Registration opening time is invalid." };
  if (opensAt && closesAt && opensAt > closesAt) return { error: "Registration opening time must precede its closing time." };

  const capacityValue = raw.capacity === "" || raw.capacity === null ? null : Number(raw.capacity);
  if (capacityValue !== null && (!Number.isInteger(capacityValue) || capacityValue < 1)) return { error: "Capacity must be a positive whole number." };
  const maxPartySize = Number(raw.maxPartySize);
  if (!Number.isInteger(maxPartySize) || maxPartySize < 1 || maxPartySize > 5) return { error: "Maximum party size must be between 1 and 5." };
  const status = text("status") as EventStatus;
  if (!eventStatuses.includes(status)) return { error: "Event status is invalid." };

  return {
    data: {
      slug,
      title: text("title"),
      subtitle: text("subtitle"),
      startsAt: startsAt.toISOString(),
      endsAt: endsAt?.toISOString() || "",
      timeZone: text("timeZone"),
      locationName: text("locationName"),
      locationAddress: text("locationAddress"),
      summary: text("summary"),
      description: text("description"),
      heroImageUrl,
      capacity: capacityValue,
      registrationOpensAt: opensAt?.toISOString() || "",
      registrationClosesAt: closesAt?.toISOString() || "",
      maxPartySize,
      status,
      isFeatured: raw.isFeatured === true,
      displayOrder: Number.isInteger(Number(raw.displayOrder)) ? Number(raw.displayOrder) : 0,
    },
  };
}
