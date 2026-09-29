"use client";

import { useState } from "react";
import styles from "./RegistrationCommunications.module.css";

type Props = { eventId: string; registrationId?: string; eventTitle?: string };
export function RegistrationCommunications({ eventId, registrationId, eventTitle = "Event" }: Props) {
  const [subject, setSubject] = useState(""); const [body, setBody] = useState("");
  const [status, setStatus] = useState("confirmed"); const [attendanceMode, setAttendanceMode] = useState("");
  const [recipientCount, setRecipientCount] = useState<number | null>(null); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function request(input: Record<string, unknown>) { const response = await fetch(`/api/events/${eventId}/communications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), cache: "no-store" }); const result = await response.json().catch(() => ({})); if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Communication request failed."); return result as { recipientCount?: number; accepted?: number; skipped?: number; failed?: number }; }
  async function preview() { setBusy(true); setMessage(""); try { const result = await request({ action: "preview", filters: { status, attendanceMode: attendanceMode || null } }); setRecipientCount(result.recipientCount ?? 0); setMessage(`${result.recipientCount ?? 0} recipient(s) match this group.`); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to preview recipients."); } finally { setBusy(false); } }
  async function send() { if (recipientCount === null || !window.confirm(`Send this update to exactly ${recipientCount} recipient(s)?`)) return; setBusy(true); setMessage(""); try { const result = await request({ action: "send", filters: { status, attendanceMode: attendanceMode || null }, subject, body, confirm: true, confirmedRecipientCount: recipientCount }); setMessage(`Processed ${result.recipientCount ?? recipientCount}: ${result.accepted ?? 0} accepted, ${result.skipped ?? 0} skipped, ${result.failed ?? 0} failed.`); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to send update."); } finally { setBusy(false); } }
  async function resend() { if (!registrationId) return; setBusy(true); setMessage(""); try { const response = await fetch(`/api/events/${eventId}/registrations/${registrationId}/communications`, { method: "POST", cache: "no-store" }); const result = await response.json().catch(() => ({})); if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Unable to resend confirmation."); setMessage("Confirmation processed."); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to resend confirmation."); } finally { setBusy(false); } }
  return <section className={styles.card} aria-labelledby="communications-heading">
    <h2 id="communications-heading">Attendee communications</h2><p className={styles.hint}>Compose an update for a filtered group or resend one confirmation.</p>
    {registrationId && <button type="button" className={styles.secondary} onClick={() => void resend()} disabled={busy}>Resend confirmation</button>}
    <div className={styles.grid}><label>Status<select value={status} onChange={(event) => { setStatus(event.target.value); setRecipientCount(null); }}><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option><option value="all">All registrations</option></select></label><label>Attendance mode<select value={attendanceMode} onChange={(event) => { setAttendanceMode(event.target.value); setRecipientCount(null); }}><option value="">Any mode</option><option value="in-person">In person</option><option value="zoom">Zoom</option></select></label></div>
    <label>Subject<input value={subject} maxLength={300} onChange={(event) => setSubject(event.target.value)} placeholder={`Update about ${eventTitle}`} /></label>
    <label>Message<textarea value={body} maxLength={10000} onChange={(event) => setBody(event.target.value)} rows={6} placeholder="Write a concise update for attendees." /></label>
    <div className={styles.actions}><button type="button" className={styles.secondary} onClick={() => void preview()} disabled={busy}>Preview recipients</button><button type="button" onClick={() => void send()} disabled={busy || recipientCount === null || !subject.trim() || !body.trim()}>Send update</button></div>
    {message && <p className={styles.message} role="status">{message}</p>}
  </section>;
}
