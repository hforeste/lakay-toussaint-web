import { getDatabase } from "./database";
import {
  decryptPersonalData,
  encryptPersonalData,
  normalizedEmail,
  personalDataLookupHash,
} from "./privacy";
import type { AdminRegistration, AdminRegistrationInput } from "./registration-types";

export class RegistrationValidationError extends Error {}
export class EventNotFoundError extends Error {}
export class RegistrationNotFoundError extends Error {}
export class DuplicateRegistrationError extends Error {}
export class CapacityError extends Error {}

interface RegistrationRow {
  id: string;
  event_id: string;
  first_name_encrypted: Uint8Array;
  last_name_encrypted: Uint8Array | null;
  email_encrypted: Uint8Array;
  email_lookup_hash?: Uint8Array;
  attendee_count: number;
  phone_encrypted: Uint8Array | null;
  whatsapp_phone_encrypted: Uint8Array | null;
  whatsapp_opt_in: boolean;
  status: "confirmed" | "cancelled";
  created_at: Date;
  updated_at: Date;
  cancelled_at: Date | null;
  date_of_birth_encrypted: Uint8Array | null;
  gender_encrypted: Uint8Array | null;
  city_encrypted: Uint8Array | null;
  county_encrypted: Uint8Array | null;
  attendance_mode: "in-person" | "zoom" | null;
  accommodations_encrypted: Uint8Array | null;
  media_acknowledgement: boolean | null;
}

interface EventCapacityRow {
  id: string;
  capacity: number | null;
  registered_attendees: number;
  max_party_size: number;
}

interface IdRow { id: string }
interface ExistsRow { exists: boolean }

const PHONE_PATTERN = /^\+?[0-9 ()-]{7,24}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const GENDER_OPTIONS = new Set(["female", "male", "nonbinary", "other", "prefer-not-to-say"]);

const textFields = ["firstName", "lastName", "phone", "whatsappPhone", "dateOfBirth", "gender", "city", "county", "accommodations"] as const;

function clean(value: unknown, field: string, max = 500) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") throw new RegistrationValidationError(`${field} must be text.`);
  const result = value.trim();
  if (result.length > max) throw new RegistrationValidationError(`${field} is too long.`);
  return result;
}

export function validateRegistrationInput(value: unknown, partial = false): AdminRegistrationInput | Partial<AdminRegistrationInput> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new RegistrationValidationError("Request body must be an object.");
  const input = value as Record<string, unknown>;
  const allowed = new Set(["firstName", "lastName", "email", "phone", "whatsappPhone", "whatsappOptIn", "attendeeCount", "dateOfBirth", "gender", "city", "county", "attendanceMode", "accommodations", "mediaAcknowledgement"]);
  for (const key of Object.keys(input)) if (!allowed.has(key)) throw new RegistrationValidationError(`Unknown field: ${key}.`);
  const result: Record<string, unknown> = {};
  for (const field of textFields) if (field in input) result[field] = clean(input[field], field);
  if ("email" in input) {
    const email = clean(input.email, "email", 320).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new RegistrationValidationError("email must be valid.");
    result.email = email;
  } else if (!partial) throw new RegistrationValidationError("email is required.");
  if ("firstName" in input) {
    if (!(result.firstName as string)) throw new RegistrationValidationError("firstName is required.");
  } else if (!partial) throw new RegistrationValidationError("firstName is required.");
  if ("attendeeCount" in input) {
    if (typeof input.attendeeCount !== "number" || !Number.isInteger(input.attendeeCount) || input.attendeeCount < 1 || input.attendeeCount > 5) throw new RegistrationValidationError("attendeeCount must be an integer from 1 to 5.");
    result.attendeeCount = input.attendeeCount;
  } else if (!partial) throw new RegistrationValidationError("attendeeCount is required.");
  if ("whatsappOptIn" in input) {
    if (typeof input.whatsappOptIn !== "boolean") throw new RegistrationValidationError("whatsappOptIn must be boolean.");
    result.whatsappOptIn = input.whatsappOptIn;
  }
  if ("mediaAcknowledgement" in input) {
    if (typeof input.mediaAcknowledgement !== "boolean") throw new RegistrationValidationError("mediaAcknowledgement must be boolean.");
    result.mediaAcknowledgement = input.mediaAcknowledgement;
  }
  if ("attendanceMode" in input) {
    if (input.attendanceMode !== undefined && input.attendanceMode !== "in-person" && input.attendanceMode !== "zoom") throw new RegistrationValidationError("attendanceMode is invalid.");
    result.attendanceMode = input.attendanceMode;
  }
  if (result.phone && !PHONE_PATTERN.test(result.phone as string)) throw new RegistrationValidationError("phone is invalid.");
  if (result.whatsappPhone && !PHONE_PATTERN.test(result.whatsappPhone as string)) throw new RegistrationValidationError("whatsappPhone is invalid.");
  if (result.dateOfBirth) {
    const date = result.dateOfBirth as string;
    const parsed = DATE_PATTERN.test(date) ? new Date(`${date}T00:00:00Z`) : null;
    if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || parsed > new Date()) {
      throw new RegistrationValidationError("dateOfBirth is invalid.");
    }
  }
  if (result.gender && !GENDER_OPTIONS.has(result.gender as string)) throw new RegistrationValidationError("gender is invalid.");
  if (result.whatsappOptIn === true && !(result.whatsappPhone as string) && !partial) throw new RegistrationValidationError("whatsappPhone is required when whatsappOptIn is true.");
  if (result.whatsappPhone && result.whatsappOptIn !== true) throw new RegistrationValidationError("whatsappOptIn must be true when whatsappPhone is provided.");
  return result as unknown as AdminRegistrationInput;
}

function mapRegistration(row: RegistrationRow): AdminRegistration {
  const encryptedValues = {
    first_name: row.first_name_encrypted,
    last_name: row.last_name_encrypted,
    email: row.email_encrypted,
    phone: row.phone_encrypted,
    whatsapp_phone: row.whatsapp_phone_encrypted,
    date_of_birth: row.date_of_birth_encrypted,
    gender: row.gender_encrypted,
    city: row.city_encrypted,
    county: row.county_encrypted,
    accommodations: row.accommodations_encrypted,
  };
  const value = (name: keyof typeof encryptedValues) => decryptPersonalData(encryptedValues[name]);
  return {
    id: row.id, eventId: row.event_id, firstName: value("first_name"), lastName: value("last_name"), email: value("email"),
    phone: value("phone"), whatsappPhone: value("whatsapp_phone"), whatsappOptIn: row.whatsapp_opt_in,
    attendeeCount: row.attendee_count, status: row.status, createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString(),
    cancelledAt: row.cancelled_at?.toISOString() || "", dateOfBirth: value("date_of_birth"), gender: value("gender"), city: value("city"), county: value("county"),
    attendanceMode: row.attendance_mode, accommodations: value("accommodations"), mediaAcknowledgement: row.media_acknowledgement,
  };
}

const columns = `id, event_id, first_name_encrypted, last_name_encrypted, email_encrypted, attendee_count,
  phone_encrypted, whatsapp_phone_encrypted, whatsapp_opt_in, status, created_at, updated_at, cancelled_at,
  date_of_birth_encrypted, gender_encrypted, city_encrypted, county_encrypted, attendance_mode,
  accommodations_encrypted, media_acknowledgement`;

export async function createAdminRegistration(eventId: string, input: unknown) {
  const data = validateRegistrationInput(input) as AdminRegistrationInput;
  const email = normalizedEmail(data.email);
  const hash = personalDataLookupHash(email);
  const sql = getDatabase();
  return sql.begin(async (tx) => {
    const events = await tx<EventCapacityRow[]>`SELECT id, capacity, registered_attendees, max_party_size FROM events WHERE id = ${eventId} FOR UPDATE`;
    const event = events[0]; if (!event) throw new EventNotFoundError();
    if (data.attendeeCount > event.max_party_size) throw new CapacityError();
    const duplicate = await tx<ExistsRow[]>`SELECT EXISTS(SELECT 1 FROM event_registrations WHERE event_id = ${eventId} AND email_lookup_hash = ${hash} AND status = 'confirmed') AS exists`;
    if (duplicate[0]?.exists) throw new DuplicateRegistrationError();
    const capacity = await tx<IdRow[]>`UPDATE events SET registered_attendees = registered_attendees + ${data.attendeeCount}, updated_at = now() WHERE id = ${eventId} AND (capacity IS NULL OR registered_attendees + ${data.attendeeCount} <= capacity) RETURNING id`;
    if (!capacity.length) throw new CapacityError();
    const rows = await tx<RegistrationRow[]>`INSERT INTO event_registrations (event_id, first_name_encrypted, last_name_encrypted, email_encrypted, email_lookup_hash, attendee_count, phone_encrypted, whatsapp_phone_encrypted, whatsapp_opt_in, date_of_birth_encrypted, gender_encrypted, city_encrypted, county_encrypted, attendance_mode, accommodations_encrypted, media_acknowledgement) VALUES (${eventId}, ${encryptPersonalData(data.firstName)}, ${data.lastName ? encryptPersonalData(data.lastName) : null}, ${encryptPersonalData(email)}, ${hash}, ${data.attendeeCount}, ${data.phone ? encryptPersonalData(data.phone) : null}, ${data.whatsappPhone ? encryptPersonalData(data.whatsappPhone) : null}, ${data.whatsappOptIn ?? false}, ${data.dateOfBirth ? encryptPersonalData(data.dateOfBirth) : null}, ${data.gender ? encryptPersonalData(data.gender) : null}, ${data.city ? encryptPersonalData(data.city) : null}, ${data.county ? encryptPersonalData(data.county) : null}, ${data.attendanceMode ?? null}, ${data.accommodations ? encryptPersonalData(data.accommodations) : null}, ${data.mediaAcknowledgement ?? null}) RETURNING ${tx.unsafe(columns)}`;
    return mapRegistration(rows[0]);
  });
}

export async function updateAdminRegistration(eventId: string, registrationId: string, input: unknown) {
  const data = validateRegistrationInput(input, true) as Partial<AdminRegistrationInput>;
  if (!Object.keys(data).length) throw new RegistrationValidationError("At least one field is required.");
  const sql = getDatabase();
  return sql.begin(async (tx) => {
    const events = await tx<EventCapacityRow[]>`SELECT id, capacity, registered_attendees, max_party_size FROM events WHERE id = ${eventId} FOR UPDATE`;
    if (!events.length) throw new EventNotFoundError();
    const rows = await tx<(RegistrationRow & { current_email_lookup_hash: Uint8Array })[]>`SELECT ${tx.unsafe(columns)}, email_lookup_hash AS current_email_lookup_hash FROM event_registrations WHERE id = ${registrationId} AND event_id = ${eventId} FOR UPDATE`;
    const current = rows[0]; if (!current) throw new RegistrationNotFoundError();
    if (current.status === "cancelled" && data.attendeeCount !== undefined && data.attendeeCount !== current.attendee_count) throw new RegistrationValidationError("Cancelled registrations cannot change party size.");
    const oldCount = current.attendee_count; const nextCount = data.attendeeCount ?? oldCount; const delta = nextCount - oldCount;
    if (nextCount > events[0].max_party_size) throw new CapacityError();
    if (delta > 0) {
      const ok = await tx<IdRow[]>`UPDATE events SET registered_attendees = registered_attendees + ${delta}, updated_at = now() WHERE id = ${eventId} AND (capacity IS NULL OR registered_attendees + ${delta} <= capacity) RETURNING id`;
      if (!ok.length) throw new CapacityError();
    } else if (delta < 0) await tx`UPDATE events SET registered_attendees = GREATEST(0, registered_attendees + ${delta}), updated_at = now() WHERE id = ${eventId}`;
    const email = data.email === undefined ? decryptPersonalData(current.email_encrypted) : normalizedEmail(data.email);
    const hash = personalDataLookupHash(email);
    if (data.email !== undefined) {
      const duplicate = await tx<ExistsRow[]>`SELECT EXISTS(SELECT 1 FROM event_registrations WHERE event_id = ${eventId} AND email_lookup_hash = ${hash} AND status = 'confirmed' AND id <> ${registrationId}) AS exists`;
      if (duplicate[0]?.exists) throw new DuplicateRegistrationError();
    }
    const rows2 = await tx<RegistrationRow[]>`UPDATE event_registrations SET first_name_encrypted = ${data.firstName === undefined ? current.first_name_encrypted : encryptPersonalData(data.firstName)}, last_name_encrypted = ${data.lastName === undefined ? current.last_name_encrypted : (data.lastName ? encryptPersonalData(data.lastName) : null)}, email_encrypted = ${data.email === undefined ? current.email_encrypted : encryptPersonalData(email)}, email_lookup_hash = ${data.email === undefined ? current.current_email_lookup_hash : hash}, attendee_count = ${nextCount}, phone_encrypted = ${data.phone === undefined ? current.phone_encrypted : (data.phone ? encryptPersonalData(data.phone) : null)}, whatsapp_phone_encrypted = ${data.whatsappOptIn === false && data.whatsappPhone === undefined ? null : data.whatsappPhone === undefined ? current.whatsapp_phone_encrypted : (data.whatsappPhone ? encryptPersonalData(data.whatsappPhone) : null)}, whatsapp_opt_in = ${data.whatsappOptIn === undefined ? current.whatsapp_opt_in : data.whatsappOptIn}, date_of_birth_encrypted = ${data.dateOfBirth === undefined ? current.date_of_birth_encrypted : (data.dateOfBirth ? encryptPersonalData(data.dateOfBirth) : null)}, gender_encrypted = ${data.gender === undefined ? current.gender_encrypted : (data.gender ? encryptPersonalData(data.gender) : null)}, city_encrypted = ${data.city === undefined ? current.city_encrypted : (data.city ? encryptPersonalData(data.city) : null)}, county_encrypted = ${data.county === undefined ? current.county_encrypted : (data.county ? encryptPersonalData(data.county) : null)}, attendance_mode = ${data.attendanceMode === undefined ? current.attendance_mode : data.attendanceMode}, accommodations_encrypted = ${data.accommodations === undefined ? current.accommodations_encrypted : (data.accommodations ? encryptPersonalData(data.accommodations) : null)}, media_acknowledgement = ${data.mediaAcknowledgement === undefined ? current.media_acknowledgement : data.mediaAcknowledgement}, updated_at = now() WHERE id = ${registrationId} AND event_id = ${eventId} RETURNING ${tx.unsafe(columns)}`;
    return mapRegistration(rows2[0]);
  });
}

export async function cancelAdminRegistration(eventId: string, registrationId: string) {
  const sql = getDatabase();
  return sql.begin(async (tx) => {
    const events = await tx<IdRow[]>`SELECT id FROM events WHERE id = ${eventId} FOR UPDATE`;
    if (!events.length) throw new EventNotFoundError();
    const rows = await tx<RegistrationRow[]>`SELECT ${tx.unsafe(columns)} FROM event_registrations WHERE id = ${registrationId} AND event_id = ${eventId} FOR UPDATE`;
    const current = rows[0]; if (!current) throw new RegistrationNotFoundError();
    if (current.status === "cancelled") return mapRegistration(current);
    await tx`UPDATE event_registrations SET status = 'cancelled', cancelled_at = now(), updated_at = now(), cancellation_token_hash = NULL WHERE id = ${registrationId}`;
    await tx`UPDATE events SET registered_attendees = GREATEST(0, registered_attendees - ${current.attendee_count}), updated_at = now() WHERE id = ${eventId}`;
    return mapRegistration({ ...current, status: "cancelled", cancelled_at: new Date(), updated_at: new Date() });
  });
}
