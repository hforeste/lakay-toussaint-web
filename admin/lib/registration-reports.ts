import { getDatabase } from "./database";

export interface RegistrationReportRange {
  startDate: string | null;
  endDate: string | null;
}

export interface RegistrationReport {
  range: RegistrationReportRange;
  confirmedRegistrations: number;
  cancelledRegistrations: number;
  currentAttendees: number;
  cancellationRate: number;
  averagePartySize: number;
  partySizeDistribution: Array<{ partySize: number; registrations: number }>;
  attendanceModes: Array<{ mode: "in-person" | "zoom" | "unspecified"; registrations: number; attendees: number }>;
  dailyGrowth: Array<{ date: string; registrations: number; attendees: number }>;
}

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !datePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function parseReportRange(value: unknown): { range?: RegistrationReportRange; error?: string } {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const startDate = input.startDate == null || input.startDate === "" ? null : input.startDate;
  const endDate = input.endDate == null || input.endDate === "" ? null : input.endDate;
  if (startDate !== null && !validDate(startDate)) return { error: "Start date must use YYYY-MM-DD." };
  if (endDate !== null && !validDate(endDate)) return { error: "End date must use YYYY-MM-DD." };
  if (startDate && endDate && startDate > endDate) return { error: "Start date must be on or before end date." };
  return { range: { startDate: startDate as string | null, endDate: endDate as string | null } };
}

type CountRow = { confirmed: string; cancelled: string; attendees: string; average_party_size: number | null };
type PartyRow = { party_size: number; registrations: string };
type ModeRow = { mode: "in-person" | "zoom" | null; registrations: string; attendees: string };
type GrowthRow = { date: string; registrations: string; attendees: string };

const asNumber = (value: string | number | null | undefined) => value == null ? 0 : Number(value);

export async function getRegistrationReport(eventId: string, range: RegistrationReportRange = { startDate: null, endDate: null }): Promise<RegistrationReport | null> {
  const sql = getDatabase();
  const events = await sql<{ id: string }[]>`SELECT id FROM events WHERE id = ${eventId}`;
  if (!events[0]) return null;
  const start = range.startDate ? `${range.startDate}T00:00:00.000Z` : null;
  const endExclusive = range.endDate ? `${range.endDate}T00:00:00.000Z` : null;
  const where = sql`event_id = ${eventId}
    AND (${start}::timestamptz IS NULL OR created_at >= ${start}::timestamptz)
    AND (${endExclusive}::timestamptz IS NULL OR created_at < (${endExclusive}::timestamptz + interval '1 day'))`;
  const [countRows, partyRows, modeRows, growthRows] = await Promise.all([
    sql<CountRow[]>`SELECT COUNT(*) FILTER (WHERE status = 'confirmed')::text AS confirmed,
      COUNT(*) FILTER (WHERE status = 'cancelled')::text AS cancelled,
      COALESCE(SUM(attendee_count) FILTER (WHERE status = 'confirmed'), 0)::text AS attendees,
      AVG(attendee_count) FILTER (WHERE status = 'confirmed') AS average_party_size
      FROM event_registrations WHERE ${where}`,
    sql<PartyRow[]>`SELECT attendee_count AS party_size, COUNT(*)::text AS registrations
      FROM event_registrations WHERE ${where} AND status = 'confirmed'
      GROUP BY attendee_count ORDER BY attendee_count`,
    sql<ModeRow[]>`SELECT attendance_mode AS mode, COUNT(*)::text AS registrations,
      COALESCE(SUM(attendee_count), 0)::text AS attendees
      FROM event_registrations WHERE ${where} AND status = 'confirmed'
      GROUP BY attendance_mode ORDER BY attendance_mode NULLS LAST`,
    sql<GrowthRow[]>`SELECT (created_at AT TIME ZONE 'UTC')::date::text AS date,
      COUNT(*) FILTER (WHERE status = 'confirmed')::text AS registrations,
      COALESCE(SUM(attendee_count) FILTER (WHERE status = 'confirmed'), 0)::text AS attendees
      FROM event_registrations WHERE ${where}
      GROUP BY (created_at AT TIME ZONE 'UTC')::date ORDER BY date`,
  ]);
  const counts = countRows[0] || { confirmed: "0", cancelled: "0", attendees: "0", average_party_size: null };
  const confirmed = asNumber(counts.confirmed);
  const cancelled = asNumber(counts.cancelled);
  const total = confirmed + cancelled;
  return {
    range,
    confirmedRegistrations: confirmed,
    cancelledRegistrations: cancelled,
    currentAttendees: asNumber(counts.attendees),
    cancellationRate: total ? Math.round((cancelled / total) * 10000) / 100 : 0,
    averagePartySize: counts.average_party_size == null ? 0 : Math.round(Number(counts.average_party_size) * 100) / 100,
    partySizeDistribution: partyRows.map((row) => ({ partySize: row.party_size, registrations: asNumber(row.registrations) })),
    attendanceModes: modeRows.map((row) => ({ mode: row.mode || "unspecified", registrations: asNumber(row.registrations), attendees: asNumber(row.attendees) })),
    dailyGrowth: growthRows.map((row) => ({ date: row.date, registrations: asNumber(row.registrations), attendees: asNumber(row.attendees) })),
  };
}

export function registrationReportCsv(report: RegistrationReport) {
  const cell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const lines = [
    ["Metric", "Value"],
    ["Confirmed registrations", report.confirmedRegistrations],
    ["Cancelled registrations", report.cancelledRegistrations],
    ["Current attendees", report.currentAttendees],
    ["Cancellation rate (%)", report.cancellationRate],
    ["Average party size", report.averagePartySize],
    [],
    ["Party size", "Registrations"],
    ...report.partySizeDistribution.map((item) => [item.partySize, item.registrations]),
    [],
    ["Attendance mode", "Registrations", "Attendees"],
    ...report.attendanceModes.map((item) => [item.mode, item.registrations, item.attendees]),
    [],
    ["Date (UTC)", "Registrations", "Attendees"],
    ...report.dailyGrowth.map((item) => [item.date, item.registrations, item.attendees]),
  ];
  return lines.map((line) => line.map(cell).join(",")).join("\r\n") + "\r\n";
}
