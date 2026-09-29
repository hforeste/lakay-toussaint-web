"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import type { AdminEvent, EventStatus } from "@/lib/events";
import { slugifyEventTitle } from "@/lib/slugify";
import { HeroImageUpload } from "@/components/HeroImageUpload";
import { RegistrationManager } from "@/components/RegistrationManager";
import { RegistrationCommunications } from "@/components/RegistrationCommunications";
import { RegistrationReports } from "@/components/RegistrationReports";
import { AuditHistory } from "@/components/AuditHistory";

type EventDraft = Omit<AdminEvent, "id" | "registeredAttendees">;

const emptyEvent: EventDraft = {
  slug: "",
  title: "",
  subtitle: "",
  startsAt: "",
  endsAt: "",
  timeZone: "America/Los_Angeles",
  locationName: "",
  locationAddress: "",
  summary: "",
  description: "",
  heroImageUrl: "",
  capacity: null,
  registrationOpensAt: "",
  registrationClosesAt: "",
  maxPartySize: 5,
  status: "draft",
  isFeatured: false,
  displayOrder: 0,
};

function toLocalInput(value: string) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromEvent(event: AdminEvent): EventDraft {
  return {
    ...event,
    startsAt: toLocalInput(event.startsAt),
    endsAt: toLocalInput(event.endsAt),
    registrationOpensAt: toLocalInput(event.registrationOpensAt),
    registrationClosesAt: toLocalInput(event.registrationClosesAt),
  };
}

function createDraftUploadId() {
  const randomId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return randomId.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function payload(draft: EventDraft) {
  const iso = (value: string) => (value ? new Date(value).toISOString() : "");
  return {
    ...draft,
    startsAt: iso(draft.startsAt),
    endsAt: iso(draft.endsAt),
    registrationOpensAt: iso(draft.registrationOpensAt),
    registrationClosesAt: iso(draft.registrationClosesAt),
  };
}

export function EventManager({ initialEvents, publicSiteUrl }: { initialEvents: AdminEvent[]; publicSiteUrl: string }) {
  const [events, setEvents] = useState(initialEvents);
  const [selectedId, setSelectedId] = useState<string | null>(initialEvents[0]?.id || null);
  const [draft, setDraft] = useState<EventDraft>(initialEvents[0] ? fromEvent(initialEvents[0]) : emptyEvent);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [draftUploadId, setDraftUploadId] = useState(createDraftUploadId);
  const [view, setView] = useState<"event" | "registrations" | "communications" | "reports" | "audit">("event");
  const selected = useMemo(() => events.find((event) => event.id === selectedId) || null, [events, selectedId]);
  const syncAttendance = useCallback((registeredAttendees: number) => {
    if (!selectedId) return;
    setEvents((current) => current.map((event) => event.id === selectedId ? { ...event, registeredAttendees } : event));
  }, [selectedId]);

  function choose(event: AdminEvent) {
    setSelectedId(event.id);
    setDraft(fromEvent(event));
    setMessage("");
    setView("event");
    setDraftUploadId(createDraftUploadId());
  }

  function startNew() {
    setSelectedId(null);
    setDraft(emptyEvent);
    setMessage("");
    setView("event");
    setDraftUploadId(createDraftUploadId());
  }

  function update<K extends keyof EventDraft>(key: K, value: EventDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(selectedId ? `/api/events/${selectedId}` : "/api/events", {
        method: selectedId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(draft)),
      });
      const result = await response.json() as { event?: AdminEvent; error?: string };
      if (!response.ok || !result.event) throw new Error(result.error || "Unable to save event.");

      setEvents((current) => {
        const next = selectedId
          ? current.map((item) => item.id === result.event?.id ? result.event : item)
          : [result.event!, ...current];
        return next.sort((a, b) => b.startsAt.localeCompare(a.startsAt));
      });
      setSelectedId(result.event.id);
      setDraft(fromEvent(result.event));
      setMessage(selectedId ? "Event updated." : "Event created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save event.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!selected || !window.confirm(`Delete “${selected.title}”? This also deletes its registrations.`)) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/events/${selected.id}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to delete event.");
      const remaining = events.filter((event) => event.id !== selected.id);
      setEvents(remaining);
      if (remaining[0]) choose(remaining[0]); else startNew();
      setMessage("Event deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete event.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dashboardShell">
      <aside className="eventRail" aria-label="Events">
        <div className="railHeader">
          <div><p className="eyebrow">Event inventory</p><h1>Events</h1></div>
          <button className="primaryButton compact" type="button" onClick={startNew}>New event</button>
        </div>
        <div className="eventList">
          {events.map((event) => (
            <button className="eventListItem" data-active={event.id === selectedId} key={event.id} onClick={() => choose(event)} type="button">
              <span className={`statusDot ${event.status}`} aria-hidden="true" />
              <span><strong>{event.title}</strong><small>{new Date(event.startsAt).toLocaleDateString()} · {event.status}</small></span>
            </button>
          ))}
          {!events.length ? <p className="emptyState">No events yet. Create the first one.</p> : null}
        </div>
      </aside>

      <section className="editorPanel">
        <div className="editorHeading">
          <div><p className="eyebrow">{selected ? "Edit event" : "Create event"}</p><h2>{selected ? selected.title : "New community event"}</h2></div>
          <div className="editorHeadingActions">
            {selected?.status === "published" ? <a href={`${publicSiteUrl}/events/${selected.slug}`} target="_blank" rel="noreferrer">Open public page ↗</a> : null}
            {selected ? <div className="viewTabs" aria-label="Event workspace">
              <button type="button" className="textButton" aria-pressed={view === "event"} data-active={view === "event"} onClick={() => setView("event")}>Edit event</button>
              <button type="button" className="textButton" aria-pressed={view === "registrations"} data-active={view === "registrations"} onClick={() => setView("registrations")}>Registrations</button>
              <button type="button" className="textButton" aria-pressed={view === "communications"} data-active={view === "communications"} onClick={() => setView("communications")}>Communications</button>
              <button type="button" className="textButton" aria-pressed={view === "reports"} data-active={view === "reports"} onClick={() => setView("reports")}>Reports</button>
              <button type="button" className="textButton" aria-pressed={view === "audit"} data-active={view === "audit"} onClick={() => setView("audit")}>Audit</button>
            </div> : null}
          </div>
        </div>

        {selected && view === "registrations" ? <RegistrationManager eventId={selected.id} eventTitle={selected.title} maxPartySize={selected.maxPartySize} onEventAttendanceChange={syncAttendance} />
          : selected && view === "communications" ? <RegistrationCommunications eventId={selected.id} eventTitle={selected.title} />
          : selected && view === "reports" ? <RegistrationReports eventId={selected.id} eventTitle={selected.title} />
          : selected && view === "audit" ? <AuditHistory eventId={selected.id} eventTitle={selected.title} />
          : <form className="eventForm" onSubmit={save}>
          <fieldset disabled={busy}>
            <legend>Event identity</legend>
            <div className="formGrid">
              <label className="wide">Title *<input value={draft.title} onChange={(e) => { update("title", e.target.value); if (!selectedId) update("slug", slugifyEventTitle(e.target.value)); }} required /></label>
              <label>Event URL<input value={draft.slug} readOnly aria-describedby="event-url-help" /><small id="event-url-help">Generated automatically from the title.</small></label>
              <label>Status<select value={draft.status} onChange={(e) => update("status", e.target.value as EventStatus)}><option value="draft">Draft</option><option value="published">Published</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option></select></label>
              <label className="wide">Subtitle<input value={draft.subtitle} onChange={(e) => update("subtitle", e.target.value)} /></label>
              <label className="wide">Summary *<textarea rows={2} value={draft.summary} onChange={(e) => update("summary", e.target.value)} required /></label>
              <label className="wide">Full description *<textarea rows={5} value={draft.description} onChange={(e) => update("description", e.target.value)} required /></label>
            </div>
          </fieldset>

          <fieldset disabled={busy}>
            <legend>Schedule and location</legend>
            <div className="formGrid">
              <label>Starts *<input type="datetime-local" value={draft.startsAt} onChange={(e) => update("startsAt", e.target.value)} required /></label>
              <label>Ends<input type="datetime-local" value={draft.endsAt} onChange={(e) => update("endsAt", e.target.value)} /></label>
              <label>Time zone *<input value={draft.timeZone} onChange={(e) => update("timeZone", e.target.value)} required /></label>
              <label>Location name *<input value={draft.locationName} onChange={(e) => update("locationName", e.target.value)} required /></label>
              <label className="wide">Location address<input value={draft.locationAddress} onChange={(e) => update("locationAddress", e.target.value)} /></label>
              <div className="wide heroImageField">
                <label>Hero image</label>
                <HeroImageUpload
                  value={draft.heroImageUrl}
                  previewUrl={draft.heroImageUrl.startsWith("/") ? `${publicSiteUrl}${draft.heroImageUrl}` : draft.heroImageUrl}
                  uploadPathPrefix={`events/${selectedId || `drafts/${draftUploadId}`}/hero`}
                  onChange={(value) => update("heroImageUrl", value)}
                />
              </div>
            </div>
          </fieldset>

          <fieldset disabled={busy}>
            <legend>Registration and display</legend>
            <div className="formGrid">
              <label>Registration opens<input type="datetime-local" value={draft.registrationOpensAt} onChange={(e) => update("registrationOpensAt", e.target.value)} /></label>
              <label>Registration closes<input type="datetime-local" value={draft.registrationClosesAt} onChange={(e) => update("registrationClosesAt", e.target.value)} /></label>
              <label>Capacity<input type="number" min="1" value={draft.capacity ?? ""} onChange={(e) => update("capacity", e.target.value ? Number(e.target.value) : null)} /></label>
              <label>Maximum party size<input type="number" min="1" max="5" value={draft.maxPartySize} onChange={(e) => update("maxPartySize", Number(e.target.value))} /></label>
              <label>Display order<input type="number" value={draft.displayOrder} onChange={(e) => update("displayOrder", Number(e.target.value))} /></label>
              <label className="checkboxLabel"><input type="checkbox" checked={draft.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} />Featured event</label>
            </div>
            {selected ? <p className="registrationCount">Current registered attendance: <strong>{selected.registeredAttendees}</strong></p> : null}
          </fieldset>

          <div className="formActions">
            <button className="primaryButton" type="submit" disabled={busy}>{busy ? "Saving…" : selected ? "Save changes" : "Create event"}</button>
            {selected ? <button className="dangerButton" type="button" onClick={remove} disabled={busy}>Delete event</button> : null}
            {message ? <p className="formMessage" role="status">{message}</p> : null}
          </div>
        </form>}
      </section>
    </div>
  );
}
