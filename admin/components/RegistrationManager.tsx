"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type {
  AdminRegistration,
  AdminRegistrationInput,
  RegistrationCapacitySummary,
  RegistrationListFilters,
  RegistrationListResponse,
} from "@/lib/registration-types";

const emptySummary: RegistrationCapacitySummary = {
  registrationCount: 0, cancelledRegistrationCount: 0, registeredAttendees: 0,
  capacity: null, remainingSpaces: null, percentFilled: null, nearCapacity: false,
};
const emptyFilters: RegistrationListFilters = {
  search: "", status: "all", attendanceMode: "all", sort: "createdAt", direction: "desc",
};
const emptyDraft: AdminRegistrationInput = { firstName: "", lastName: "", email: "", phone: "", whatsappPhone: "", attendeeCount: 1, attendanceMode: "in-person", accommodations: "" };

function asRegistration(value: unknown): AdminRegistration | null {
  if (!value || typeof value !== "object") return null;
  const r = value as Record<string, unknown>;
  if (typeof r.id !== "string") return null;
  return {
    id: r.id, eventId: typeof r.eventId === "string" ? r.eventId : "", firstName: String(r.firstName || ""), lastName: String(r.lastName || ""),
    email: String(r.email || ""), phone: String(r.phone || ""), whatsappPhone: String(r.whatsappPhone || ""), whatsappOptIn: r.whatsappOptIn === true,
    attendeeCount: Number.isFinite(Number(r.attendeeCount)) ? Number(r.attendeeCount) : 1, status: r.status === "cancelled" ? "cancelled" : "confirmed",
    createdAt: String(r.createdAt || ""), updatedAt: String(r.updatedAt || ""), cancelledAt: String(r.cancelledAt || ""), dateOfBirth: String(r.dateOfBirth || ""),
    gender: String(r.gender || ""), city: String(r.city || ""), county: String(r.county || ""), attendanceMode: r.attendanceMode === "zoom" ? "zoom" : r.attendanceMode === "in-person" ? "in-person" : null,
    accommodations: String(r.accommodations || ""), mediaAcknowledgement: typeof r.mediaAcknowledgement === "boolean" ? r.mediaAcknowledgement : null,
  };
}

function parseResponse(value: unknown): RegistrationListResponse {
  const root = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const list = Array.isArray(root.registrations) ? root.registrations.map(asRegistration).filter((r): r is AdminRegistration => Boolean(r)) : [];
  const summary = (root.summary && typeof root.summary === "object" ? root.summary : {}) as Record<string, unknown>;
  return { registrations: list, summary: { ...emptySummary, ...summary } as RegistrationCapacitySummary };
}
function date(value: string) { if (!value) return "—"; const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString([], { dateStyle: "medium", timeStyle: "short" }); }
function errorMessage(value: unknown, fallback: string) { return value && typeof value === "object" && typeof (value as { error?: unknown }).error === "string" ? (value as { error: string }).error : fallback; }

export function RegistrationManager({ eventId, eventTitle, maxPartySize, onEventAttendanceChange }: { eventId: string; eventTitle: string; maxPartySize: number; onEventAttendanceChange?: (attendees: number) => void }) {
  const [filters, setFilters] = useState<RegistrationListFilters>(emptyFilters);
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [summary, setSummary] = useState(emptySummary);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AdminRegistrationInput>(emptyDraft);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch(`/api/events/${eventId}/registrations/query`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(filters), cache: "no-store" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(errorMessage(body, "Unable to load registrations."));
      const result = parseResponse(body); setRegistrations(result.registrations); setSummary(result.summary); onEventAttendanceChange?.(result.summary.registeredAttendees);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load registrations."); }
    finally { setBusy(false); }
  }, [eventId, filters, onEventAttendanceChange]);
  useEffect(() => {
    const timeout = window.setTimeout(() => { void load(); }, 150);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const selected = useMemo(() => registrations.find((registration) => registration.id === selectedId) || null, [registrations, selectedId]);
  function setFilter<K extends keyof RegistrationListFilters>(key: K, value: RegistrationListFilters[K]) { setFilters((current) => ({ ...current, [key]: value })); }
  function beginAdd() { setAdding(true); setEditing(false); setSelectedId(null); setDraft({ ...emptyDraft }); setMessage(""); }
  function beginEdit() { if (!selected) return; setEditing(true); setAdding(false); setDraft({ firstName: selected.firstName, lastName: selected.lastName, email: selected.email, phone: selected.phone, whatsappPhone: selected.whatsappPhone, whatsappOptIn: selected.whatsappOptIn, attendeeCount: selected.attendeeCount, dateOfBirth: selected.dateOfBirth, gender: selected.gender, city: selected.city, county: selected.county, attendanceMode: selected.attendanceMode || "in-person", accommodations: selected.accommodations, mediaAcknowledgement: selected.mediaAcknowledgement ?? undefined }); }
  function update<K extends keyof AdminRegistrationInput>(key: K, value: AdminRegistrationInput[K]) { setDraft((current) => ({ ...current, [key]: value })); }
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const url = adding ? `/api/events/${eventId}/registrations` : `/api/events/${eventId}/registrations/${selectedId}`;
      const response = await fetch(url, { method: adding ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(errorMessage(body, "Unable to save registration."));
      setAdding(false); setEditing(false); setMessage(adding ? "Registration added." : "Registration updated."); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save registration."); } finally { setBusy(false); }
  }
  async function cancelRegistration() {
    if (!selected || !window.confirm(`Cancel registration for ${selected.firstName} ${selected.lastName}?`)) return;
    setBusy(true); setMessage("");
    try { const response = await fetch(`/api/events/${eventId}/registrations/${selected.id}/cancel`, { method: "POST" }); const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(errorMessage(body, "Unable to cancel registration.")); setMessage("Registration cancelled."); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to cancel registration."); } finally { setBusy(false); }
  }
  async function resendConfirmation() {
    if (!selected) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/events/${eventId}/registrations/${selected.id}/communications`, { method: "POST", cache: "no-store" });
      const body = await response.json().catch(() => ({})) as { error?: string; accepted?: number; skipped?: number; failed?: number };
      if (!response.ok) throw new Error(body.error || "Unable to resend confirmation.");
      setMessage(`Confirmation processed: ${body.accepted ?? 0} accepted, ${body.skipped ?? 0} skipped, ${body.failed ?? 0} failed.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to resend confirmation."); }
    finally { setBusy(false); }
  }
  async function exportCsv() {
    setBusy(true); setMessage("");
    try { const response = await fetch(`/api/events/${eventId}/registrations/export`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(filters) }); if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(errorMessage(body, "Unable to export roster.")); } const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "event"}-registrations.csv`; link.click(); URL.revokeObjectURL(url); setMessage("Roster export downloaded."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to export roster."); } finally { setBusy(false); }
  }

  const percent = summary.percentFilled == null ? "—" : `${Math.round(summary.percentFilled)}%`;
  return <section className="registrationManager" aria-labelledby="registration-heading">
    <div className="registrationHeader"><div><p className="eyebrow">Operations</p><h2 id="registration-heading">Registrations</h2><p className="registrationEventName">{eventTitle}</p></div><div className="registrationActions"><button className="primaryButton" type="button" onClick={beginAdd}>Add registration</button><button className="secondaryButton" type="button" onClick={exportCsv} disabled={busy}>Export CSV</button></div></div>
    <div className="capacityGrid" aria-label="Capacity overview"><div><span>Registrations</span><strong>{summary.registrationCount}</strong><small>{summary.cancelledRegistrationCount} cancelled</small></div><div><span>Attendees</span><strong>{summary.registeredAttendees}</strong><small>party size total</small></div><div><span>Capacity</span><strong>{summary.capacity ?? "Open"}</strong><small>{summary.remainingSpaces == null ? "No limit" : `${summary.remainingSpaces} spaces remaining`}</small></div><div data-warning={summary.nearCapacity ? "true" : "false"}><span>Filled</span><strong>{percent}</strong><small>{summary.nearCapacity ? "Near capacity" : "Current fill rate"}</small></div></div>
    {summary.nearCapacity ? <p className="capacityWarning" role="status">This event is near capacity. Review party-size changes before confirming.</p> : null}
    <div className="registrationToolbar"><label className="registrationSearch">Search roster<input value={filters.search} onChange={(e) => setFilter("search", e.target.value)} placeholder="Name or email" /></label><label>Status<select value={filters.status} onChange={(e) => setFilter("status", e.target.value as RegistrationListFilters["status"])}><option value="all">All statuses</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option></select></label><label>Attendance<select value={filters.attendanceMode} onChange={(e) => setFilter("attendanceMode", e.target.value as RegistrationListFilters["attendanceMode"])}><option value="all">All modes</option><option value="in-person">In person</option><option value="zoom">Zoom</option></select></label><label>Sort<select value={`${filters.sort}:${filters.direction}`} onChange={(e) => { const [sort, direction] = e.target.value.split(":") as [RegistrationListFilters["sort"], RegistrationListFilters["direction"]]; setFilters((current) => ({ ...current, sort, direction })); }}><option value="createdAt:desc">Newest first</option><option value="createdAt:asc">Oldest first</option><option value="name:asc">Name A–Z</option><option value="name:desc">Name Z–A</option><option value="partySize:desc">Largest party</option><option value="partySize:asc">Smallest party</option></select></label></div>
    {message ? <p className="formMessage" role="status">{message}</p> : null}
    <div className="registrationWorkspace"><div className="rosterTableWrap"><table className="rosterTable"><caption className="visuallyHidden">Registration roster</caption><thead><tr><th scope="col">Registrant</th><th scope="col">Party</th><th scope="col">Mode</th><th scope="col">Registered</th><th scope="col">Status</th></tr></thead><tbody>{registrations.map((registration) => <tr key={registration.id} data-selected={registration.id === selectedId}><td><button type="button" className="rosterSelect" onClick={() => { setSelectedId(registration.id); setEditing(false); setAdding(false); }}><strong>{registration.firstName} {registration.lastName}</strong><span>{registration.email}</span></button></td><td>{registration.attendeeCount}</td><td>{registration.attendanceMode === "zoom" ? "Zoom" : registration.attendanceMode === "in-person" ? "In person" : "—"}</td><td>{date(registration.createdAt)}</td><td><span className={`registrationStatus ${registration.status}`}>{registration.status}</span></td></tr>)}</tbody></table>{!registrations.length ? <p className="emptyState registrationEmpty">{busy ? "Loading registrations…" : filters.search || filters.status !== "all" || filters.attendanceMode !== "all" ? "No registrations match these filters." : "No registrations yet. Add an offline registration to get started."}</p> : null}</div>
      <aside className="registrationDetail" aria-label={selected ? `Details for ${selected.firstName} ${selected.lastName}` : "Registration details"}>{adding || editing ? <RegistrationForm draft={draft} update={update} onSubmit={save} onCancel={() => { setAdding(false); setEditing(false); }} busy={busy} maxPartySize={maxPartySize} adding={adding} /> : selected ? <><div className="detailHeading"><div><p className="eyebrow">{selected.status}</p><h3>{selected.firstName} {selected.lastName}</h3></div><span className="partyBadge">{selected.attendeeCount} attendee{selected.attendeeCount === 1 ? "" : "s"}</span></div><dl className="detailList"><dt>Email</dt><dd>{selected.email || "—"}</dd><dt>Phone</dt><dd>{selected.phone || "—"}</dd><dt>WhatsApp</dt><dd>{selected.whatsappPhone || "—"}{selected.whatsappPhone ? ` (${selected.whatsappOptIn ? "opted in" : "not opted in"})` : ""}</dd><dt>Date of birth</dt><dd>{selected.dateOfBirth || "—"}</dd><dt>Gender</dt><dd>{selected.gender || "—"}</dd><dt>Attendance</dt><dd>{selected.attendanceMode === "zoom" ? "Zoom" : selected.attendanceMode === "in-person" ? "In person" : "—"}</dd><dt>Registered</dt><dd>{date(selected.createdAt)}</dd><dt>Updated</dt><dd>{date(selected.updatedAt)}</dd><dt>Cancelled</dt><dd>{date(selected.cancelledAt)}</dd><dt>Location</dt><dd>{[selected.city, selected.county].filter(Boolean).join(", ") || "—"}</dd><dt>Accommodations</dt><dd>{selected.accommodations || "None listed"}</dd><dt>Media acknowledgement</dt><dd>{selected.mediaAcknowledgement == null ? "—" : selected.mediaAcknowledgement ? "Accepted" : "Not accepted"}</dd></dl><div className="detailActions"><button className="secondaryButton" type="button" onClick={beginEdit} disabled={busy}>Edit details</button>{selected.status === "confirmed" ? <button className="secondaryButton" type="button" onClick={resendConfirmation} disabled={busy}>Resend confirmation</button> : null}{selected.status !== "cancelled" ? <button className="dangerButton" type="button" onClick={cancelRegistration} disabled={busy}>Cancel registration</button> : null}</div></> : <div className="detailPlaceholder"><p className="eyebrow">Select a registration</p><h3>Review attendee details</h3><p>Choose a person from the roster to view their complete submission and actions.</p></div>}</aside></div>
  </section>;
}

function RegistrationForm({ draft, update, onSubmit, onCancel, busy, maxPartySize, adding }: { draft: AdminRegistrationInput; update: <K extends keyof AdminRegistrationInput>(key: K, value: AdminRegistrationInput[K]) => void; onSubmit: (event: FormEvent) => void; onCancel: () => void; busy: boolean; maxPartySize: number; adding: boolean }) {
  return <form className="registrationForm" onSubmit={onSubmit}><div className="detailHeading"><div><p className="eyebrow">{adding ? "Manual entry" : "Correction"}</p><h3>{adding ? "Add registration" : "Edit registration"}</h3></div></div><div className="formGrid"><label>First name *<input required value={draft.firstName} onChange={(e) => update("firstName", e.target.value)} /></label><label>Last name<input value={draft.lastName || ""} onChange={(e) => update("lastName", e.target.value)} /></label><label>Email *<input type="email" required value={draft.email} onChange={(e) => update("email", e.target.value)} /></label><label>Phone<input value={draft.phone || ""} onChange={(e) => update("phone", e.target.value)} /></label><label>WhatsApp<input value={draft.whatsappPhone || ""} onChange={(e) => update("whatsappPhone", e.target.value)} /></label><label className="checkboxLabel"><input type="checkbox" checked={draft.whatsappOptIn === true} onChange={(e) => update("whatsappOptIn", e.target.checked)} />WhatsApp updates</label><label>Party size *<input type="number" required min={1} max={maxPartySize} value={draft.attendeeCount} onChange={(e) => update("attendeeCount", Number(e.target.value))} /></label><label>Attendance<select value={draft.attendanceMode || "in-person"} onChange={(e) => update("attendanceMode", e.target.value as "in-person" | "zoom")}><option value="in-person">In person</option><option value="zoom">Zoom</option></select></label><label>Date of birth<input type="date" value={draft.dateOfBirth || ""} onChange={(e) => update("dateOfBirth", e.target.value)} /></label><label>Gender<select value={draft.gender || ""} onChange={(e) => update("gender", e.target.value)}><option value="">Not provided</option><option value="female">Female</option><option value="male">Male</option><option value="nonbinary">Nonbinary</option><option value="other">Other</option><option value="prefer-not-to-say">Prefer not to say</option></select></label><label>City<input value={draft.city || ""} onChange={(e) => update("city", e.target.value)} /></label><label>County<input value={draft.county || ""} onChange={(e) => update("county", e.target.value)} /></label><label className="wide">Accommodations<textarea rows={3} value={draft.accommodations || ""} onChange={(e) => update("accommodations", e.target.value)} /></label><label className="wide checkboxLabel"><input type="checkbox" checked={draft.mediaAcknowledgement === true} onChange={(e) => update("mediaAcknowledgement", e.target.checked)} />Media acknowledgement accepted</label></div><div className="formActions"><button className="primaryButton" type="submit" disabled={busy}>{busy ? "Saving…" : "Save registration"}</button><button className="secondaryButton" type="button" onClick={onCancel} disabled={busy}>Close</button></div></form>;
}
