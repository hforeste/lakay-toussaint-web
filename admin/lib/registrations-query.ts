import { decryptPersonalData } from "./privacy";
import { getDatabase } from "./database";
import type {
  AdminRegistration,
  AdminRegistrationSort,
  RegistrationCapacitySummary,
  RegistrationListFilters,
} from "./registration-types";

type RegistrationRow = {
  id: string; event_id: string; first_name_encrypted: Uint8Array; last_name_encrypted: Uint8Array | null;
  email_encrypted: Uint8Array; phone_encrypted: Uint8Array | null; whatsapp_phone_encrypted: Uint8Array | null;
  whatsapp_opt_in: boolean; attendee_count: number; status: "confirmed" | "cancelled";
  created_at: Date; updated_at: Date; cancelled_at: Date | null; date_of_birth_encrypted: Uint8Array | null;
  gender_encrypted: Uint8Array | null; city_encrypted: Uint8Array | null; county_encrypted: Uint8Array | null;
  attendance_mode: "in-person" | "zoom" | null; accommodations_encrypted: Uint8Array | null;
  media_acknowledgement: boolean | null;
};

type EventRow = { id: string; title: string; slug: string; starts_at: Date; capacity: number | null; registered_attendees: number };

const emptyFilters: RegistrationListFilters = { search: "", status: "all", attendanceMode: "all", sort: "createdAt", direction: "desc" };

export function parseRegistrationFilters(input: unknown): RegistrationListFilters {
  const value = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const status = value.status === "confirmed" || value.status === "cancelled" ? value.status : "all";
  const attendanceMode = value.attendanceMode === "in-person" || value.attendanceMode === "zoom" ? value.attendanceMode : "all";
  const sort: AdminRegistrationSort = value.sort === "name" || value.sort === "partySize" ? value.sort : "createdAt";
  const direction = value.direction === "asc" ? "asc" : "desc";
  return { search: typeof value.search === "string" ? value.search.trim().slice(0, 100) : "", status, attendanceMode, sort, direction };
}

function text(value: Uint8Array | null) { return value ? decryptPersonalData(value) : ""; }
function mapRegistration(row: RegistrationRow): AdminRegistration {
  return {
    id: row.id, eventId: row.event_id, firstName: text(row.first_name_encrypted), lastName: text(row.last_name_encrypted),
    email: text(row.email_encrypted), phone: text(row.phone_encrypted), whatsappPhone: text(row.whatsapp_phone_encrypted),
    whatsappOptIn: row.whatsapp_opt_in, attendeeCount: row.attendee_count, status: row.status,
    createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString(), cancelledAt: row.cancelled_at?.toISOString() || "",
    dateOfBirth: text(row.date_of_birth_encrypted), gender: text(row.gender_encrypted), city: text(row.city_encrypted), county: text(row.county_encrypted),
    attendanceMode: row.attendance_mode, accommodations: text(row.accommodations_encrypted), mediaAcknowledgement: row.media_acknowledgement,
  };
}

function summary(rows: AdminRegistration[], event: EventRow): RegistrationCapacitySummary {
  const confirmed = rows.filter((r) => r.status === "confirmed");
  const attendees = confirmed.reduce((sum, r) => sum + r.attendeeCount, 0);
  const remaining = event.capacity === null ? null : Math.max(event.capacity - attendees, 0);
  return { registrationCount: confirmed.length, cancelledRegistrationCount: rows.length - confirmed.length, registeredAttendees: attendees,
    capacity: event.capacity, remainingSpaces: remaining, percentFilled: event.capacity ? Math.round((attendees / event.capacity) * 10000) / 100 : null,
    nearCapacity: event.capacity !== null && (remaining === 0 || attendees / event.capacity >= 0.8) };
}

async function load(eventId: string) {
  const sql = getDatabase();
  const events = await sql<EventRow[]>`SELECT id, title, slug, starts_at, capacity, registered_attendees FROM events WHERE id = ${eventId}`;
  if (!events[0]) return null;
  const rows = await sql<RegistrationRow[]>`SELECT id, event_id, first_name_encrypted, last_name_encrypted, email_encrypted,
    phone_encrypted, whatsapp_phone_encrypted, whatsapp_opt_in, attendee_count, status, created_at, updated_at, cancelled_at,
    date_of_birth_encrypted, gender_encrypted, city_encrypted, county_encrypted, attendance_mode, accommodations_encrypted,
    media_acknowledgement FROM event_registrations WHERE event_id = ${eventId} ORDER BY created_at DESC`;
  return { event: events[0], registrations: rows.map(mapRegistration) };
}

export async function queryRegistrations(eventId: string, filters: RegistrationListFilters = emptyFilters) {
  const loaded = await load(eventId);
  if (!loaded) return null;
  const needle = filters.search.toLocaleLowerCase();
  let registrations = loaded.registrations.filter((r) =>
    (filters.status === "all" || r.status === filters.status) &&
    (filters.attendanceMode === "all" || r.attendanceMode === filters.attendanceMode) &&
    (!needle || `${r.firstName} ${r.lastName} ${r.email}`.toLocaleLowerCase().includes(needle))
  );
  const factor = filters.direction === "asc" ? 1 : -1;
  registrations = registrations.sort((a, b) => {
    if (filters.sort === "name") return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`) * factor;
    if (filters.sort === "partySize") return (a.attendeeCount - b.attendeeCount) * factor;
    return (Date.parse(a.createdAt) - Date.parse(b.createdAt)) * factor;
  });
  return { registrations, summary: summary(loaded.registrations, loaded.event), event: loaded.event };
}

export async function getRegistration(eventId: string, registrationId: string) {
  const result = await queryRegistrations(eventId, { ...emptyFilters });
  if (!result) return null;
  const registration = result.registrations.find((item) => item.id === registrationId);
  return registration ? { registration, summary: result.summary, event: result.event } : null;
}

export function csvCell(value: unknown) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function registrationsCsv(registrations: AdminRegistration[]) {
  const headers = ["Name", "Email", "Phone", "WhatsApp", "Party size", "Registered at", "Status", "Attendance mode", "City", "County"];
  const lines = registrations.map((r) => [ `${r.firstName} ${r.lastName}`.trim(), r.email, r.phone, r.whatsappPhone, r.attendeeCount, r.createdAt, r.status, r.attendanceMode || "", r.city, r.county ].map(csvCell).join(","));
  return [headers.map(csvCell).join(","), ...lines].join("\r\n") + "\r\n";
}
