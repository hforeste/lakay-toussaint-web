"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./RegistrationReports.module.css";
import type { RegistrationReport } from "@/lib/registration-reports";

const emptyReport: RegistrationReport = {
  range: { startDate: null, endDate: null }, confirmedRegistrations: 0, cancelledRegistrations: 0, currentAttendees: 0,
  cancellationRate: 0, averagePartySize: 0, partySizeDistribution: [], attendanceModes: [], dailyGrowth: [],
};
const errorText = (value: unknown) => value && typeof value === "object" && typeof (value as { error?: unknown }).error === "string" ? (value as { error: string }).error : "Unable to load registration report.";

export function RegistrationReports({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState(emptyReport);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/events/${eventId}/reports`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ startDate: startDate || undefined, endDate: endDate || undefined }), cache: "no-store" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(errorText(body));
      setReport(body as RegistrationReport);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load registration report."); }
    finally { setBusy(false); }
  }, [eventId, startDate, endDate]);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);
  async function downloadCsv() {
    setMessage("");
    try {
      const response = await fetch(`/api/events/${eventId}/reports`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ startDate: startDate || undefined, endDate: endDate || undefined, format: "csv" }), cache: "no-store" });
      if (!response.ok) throw new Error(errorText(await response.json().catch(() => ({}))));
      const url = URL.createObjectURL(await response.blob()); const link = document.createElement("a"); link.href = url; link.download = `${eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "event"}-registration-report.csv`; link.click(); URL.revokeObjectURL(url);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to download report."); }
  }
  const maxDaily = useMemo(() => Math.max(1, ...report.dailyGrowth.map((item) => item.registrations)), [report.dailyGrowth]);
  const period = [startDate, endDate].filter(Boolean).join(" to ") || "All registration dates";
  return <section className={styles.reports} aria-labelledby="registration-reports-heading">
    <div className={styles.header}><div><p className="eyebrow">Operations intelligence</p><h2 id="registration-reports-heading">Registration reports</h2><p className={styles.subtitle}>{eventTitle} · {period}</p></div><button className="secondaryButton" type="button" onClick={downloadCsv} disabled={busy}>Download aggregate CSV</button></div>
    <form className={styles.range} onSubmit={(event) => { event.preventDefault(); void load(); }}><label>From<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label>To<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label><button className="primaryButton" type="submit" disabled={busy}>{busy ? "Loading…" : "Apply dates"}</button></form>
    {message ? <p className={styles.message} role="alert">{message}</p> : null}
    <div className={styles.cards} aria-label="Registration summary"><div className={styles.card}><span>Confirmed</span><strong>{report.confirmedRegistrations}</strong></div><div className={styles.card}><span>Cancelled</span><strong>{report.cancelledRegistrations}</strong></div><div className={styles.card}><span>Current attendees</span><strong>{report.currentAttendees}</strong></div><div className={styles.card}><span>Avg. party size</span><strong>{report.averagePartySize || "—"}</strong></div><div className={styles.card}><span>Cancellation rate</span><strong>{report.cancellationRate}%</strong></div></div>
    <div className={styles.columns}><section className={styles.panel} aria-labelledby="party-size-heading"><h3 id="party-size-heading">Party size distribution</h3>{report.partySizeDistribution.length ? <table className={styles.table}><thead><tr><th scope="col">Party size</th><th scope="col">Registrations</th></tr></thead><tbody>{report.partySizeDistribution.map((item) => <tr key={item.partySize}><td>{item.partySize}</td><td>{item.registrations}</td></tr>)}</tbody></table> : <p className={styles.muted}>No confirmed registrations in this range.</p>}</section><section className={styles.panel} aria-labelledby="attendance-mode-heading"><h3 id="attendance-mode-heading">Attendance mode</h3>{report.attendanceModes.length ? <table className={styles.table}><thead><tr><th scope="col">Mode</th><th scope="col">Registrations</th><th scope="col">Attendees</th></tr></thead><tbody>{report.attendanceModes.map((item) => <tr key={item.mode}><td>{item.mode === "in-person" ? "In person" : item.mode === "zoom" ? "Zoom" : "Unspecified"}</td><td>{item.registrations}</td><td>{item.attendees}</td></tr>)}</tbody></table> : <p className={styles.muted}>No confirmed registrations in this range.</p>}</section></div>
    <section className={styles.panel} aria-labelledby="growth-heading"><h3 id="growth-heading">Daily registration growth</h3>{report.dailyGrowth.length ? <div role="list" aria-label="Daily confirmed registrations">{report.dailyGrowth.map((item) => <div className={styles.barRow} role="listitem" key={item.date}><span>{item.date}</span><span className={styles.barTrack} aria-hidden="true"><span className={styles.bar} style={{ width: `${Math.max(3, (item.registrations / maxDaily) * 100)}%` }} /></span><strong>{item.registrations}</strong></div>)}</div> : <p className={styles.muted}>No registrations in this range.</p>}</section>
  </section>;
}
