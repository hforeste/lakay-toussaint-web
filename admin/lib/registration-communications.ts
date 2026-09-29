import { getDatabase } from "./database";
import { decryptPersonalData } from "./privacy";

export type CommunicationStatus = "confirmed" | "cancelled" | "all";
export type CommunicationAttendanceMode = "in-person" | "zoom" | null;
export type CommunicationFilters = { status?: CommunicationStatus; attendanceMode?: CommunicationAttendanceMode };
type Recipient = { id: string; email: string; firstName: string; status: CommunicationStatus; attendanceMode: CommunicationAttendanceMode };

const noStore = { "Cache-Control": "private, no-store" };
export { noStore };

export function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character] || character));
}

function filters(value: CommunicationFilters = {}) {
  return {
    status: value.status === "cancelled" || value.status === "all" ? value.status : "confirmed" as CommunicationStatus,
    attendanceMode: value.attendanceMode === "in-person" || value.attendanceMode === "zoom" ? value.attendanceMode : null,
  };
}

export function parseCommunicationFilters(value: unknown): CommunicationFilters {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return filters({ status: input.status as CommunicationStatus, attendanceMode: input.attendanceMode as CommunicationAttendanceMode });
}

async function recipients(eventId: string, input?: CommunicationFilters) {
  const filter = filters(input);
  const sql = getDatabase();
  const rows = await sql<Array<{ id: string; email_encrypted: Uint8Array; first_name_encrypted: Uint8Array; status: CommunicationStatus; attendance_mode: CommunicationAttendanceMode }>>`
    SELECT id, email_encrypted, first_name_encrypted, status, attendance_mode
    FROM event_registrations WHERE event_id = ${eventId}
      AND (${filter.status} = 'all' OR status = ${filter.status})
      AND (${filter.attendanceMode}::text IS NULL OR attendance_mode = ${filter.attendanceMode}::text)
    ORDER BY created_at ASC`;
  return rows.map((row): Recipient => ({ id: row.id, email: decryptPersonalData(row.email_encrypted), firstName: decryptPersonalData(row.first_name_encrypted), status: row.status, attendanceMode: row.attendance_mode }));
}

export async function previewCommunicationRecipients(eventId: string, input: CommunicationFilters) {
  const list = await recipients(eventId, input);
  return { recipientCount: list.length };
}

function messageBody(subject: string, body: string, firstName: string, eventTitle: string) {
  const safeBody = escapeHtml(body).replace(/\r?\n/g, "<br>");
  return `<p>Hello ${escapeHtml(firstName)},</p><p>${safeBody}</p><p><strong>${escapeHtml(eventTitle)}</strong></p>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.REGISTRATION_EMAIL_FROM;
  if (!key || !from) return { state: "skipped" as const, providerMessageId: null, failureCode: "email_provider_not_configured" };
  try {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [to], subject, html }) });
    const result = await response.json().catch(() => ({})) as { id?: unknown };
    if (!response.ok) return { state: "failed" as const, providerMessageId: null, failureCode: `provider_http_${response.status}` };
    return { state: "accepted" as const, providerMessageId: typeof result.id === "string" ? result.id : null, failureCode: null };
  } catch { return { state: "failed" as const, providerMessageId: null, failureCode: "provider_request_failed" }; }
}

async function createCommunication(eventId: string, subject: string, body: string, input: CommunicationFilters, list: Recipient[]) {
  const sql = getDatabase();
  const eventRows = await sql<Array<{ title: string }>>`SELECT title FROM events WHERE id = ${eventId}`;
  if (!eventRows[0]) return null;
  const filter = filters(input);
  const htmlFor = (recipient: Recipient) => messageBody(subject, body, recipient.firstName, eventRows[0].title);
  const storedBody = `<p>${escapeHtml(body).replace(/\r?\n/g, "<br>")}</p><p><strong>${escapeHtml(eventRows[0].title)}</strong></p>`;
  const rows = await sql<Array<{ id: string }>>`INSERT INTO event_communications (event_id, subject, body_html, filter_status, filter_attendance_mode, recipient_count) VALUES (${eventId}, ${subject.slice(0, 300)}, ${storedBody}, ${filter.status}, ${filter.attendanceMode}, ${list.length}) RETURNING id`;
  const communicationId = rows[0].id;
  let accepted = 0; let skipped = 0; let failed = 0;
  for (const recipient of list) {
    const delivery = await sendEmail(recipient.email, subject, htmlFor(recipient));
    if (delivery.state === "accepted") accepted += 1; else if (delivery.state === "skipped") skipped += 1; else failed += 1;
    await sql`INSERT INTO event_communication_deliveries (communication_id, registration_id, provider_message_id, state, failure_code) VALUES (${communicationId}, ${recipient.id}, ${delivery.providerMessageId}, ${delivery.state}, ${delivery.failureCode})`;
  }
  return { communicationId, recipientCount: list.length, accepted, skipped, failed };
}

export async function resendRegistrationConfirmation(eventId: string, registrationId: string) {
  const sql = getDatabase();
  const rows = await sql<Array<{ id: string; title: string; email_encrypted: Uint8Array; first_name_encrypted: Uint8Array; status: CommunicationStatus }>>`SELECT r.id, e.title, r.email_encrypted, r.first_name_encrypted, r.status FROM event_registrations r JOIN events e ON e.id = r.event_id WHERE r.id = ${registrationId} AND r.event_id = ${eventId}`;
  const row = rows[0]; if (!row) return null;
  if (row.status !== "confirmed") return { error: "Only confirmed registrations can receive a confirmation.", status: 409 };
  return createCommunication(eventId, `Confirmation: ${row.title}`, "This is a confirmation of your registration. We look forward to seeing you.", { status: "confirmed" }, [{ id: row.id, email: decryptPersonalData(row.email_encrypted), firstName: decryptPersonalData(row.first_name_encrypted), status: row.status, attendanceMode: null }]);
}

export async function sendEventCommunication(eventId: string, subject: string, body: string, input: CommunicationFilters, expectedRecipientCount: number) {
  const list = await recipients(eventId, input);
  if (list.length !== expectedRecipientCount) return { error: "Recipient count changed; preview again before sending.", status: 409, recipientCount: list.length };
  return createCommunication(eventId, subject, body, input, list);
}
