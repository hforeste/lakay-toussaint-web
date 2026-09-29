"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./AuditHistory.module.css";

type Entry = { id: string; actor: string; action: string; registrationId: string | null; metadata: Record<string, unknown>; createdAt: string };
const actions = ["", "event.create", "event.update", "event.delete", "registration.view", "registration.query", "registration.create", "registration.update", "registration.cancel", "registration.export", "communication.preview", "communication.send", "communication.resend_confirmation"];

export function AuditHistory({ eventId, eventTitle }: { eventId: string; eventTitle?: string }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");
  const load = useCallback(async () => {
    setStatus("Loading…");
    try {
      const response = await fetch(`/api/events/${eventId}/audit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, from, to }), cache: "no-store" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : "Unable to load audit history.");
      setEntries(Array.isArray(body.entries) ? body.entries : []); setStatus("");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to load audit history."); }
  }, [eventId, action, from, to]);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);
  return <section className={styles.panel} aria-labelledby={`audit-heading-${eventId}`}>
    <div className={styles.heading}><h2 id={`audit-heading-${eventId}`}>Audit history{eventTitle ? `: ${eventTitle}` : ""}</h2><span className={styles.status}>{status || `${entries.length} entr${entries.length === 1 ? "y" : "ies"}`}</span></div>
    <form className={styles.filters} onSubmit={(event) => { event.preventDefault(); void load(); }}>
      <label className={styles.field}>Action<select value={action} onChange={(event) => setAction(event.target.value)}>{actions.map((value) => <option key={value} value={value}>{value || "All actions"}</option>)}</select></label>
      <label className={styles.field}>From<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
      <label className={styles.field}>To<input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
      <button className={styles.button} type="submit">Apply filters</button>
    </form>
    <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th scope="col">When</th><th scope="col">Action</th><th scope="col">Actor</th><th scope="col">Target</th><th scope="col">Details</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id}><td>{new Date(entry.createdAt).toLocaleString()}</td><td>{entry.action}</td><td>{entry.actor}</td><td>{entry.registrationId ? "Registration" : "Event"}</td><td className={styles.metadata}>{JSON.stringify(entry.metadata)}</td></tr>)}</tbody></table></div>
  </section>;
}
