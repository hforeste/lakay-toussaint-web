export const KNOW_YOUR_RIGHTS_CALENDAR = {
  slug: "know-your-rights",
  title: "Know Your Rights Workshop",
  start: "20261017T110000",
  end: "20261017T140000",
  startUtc: "20261017T180000Z",
  endUtc: "20261017T210000Z",
  timeZone: "America/Los_Angeles",
  dateLabel: "Saturday, October 17, 2026",
  timeLabel: "11 AM–2 PM PT",
  address: "Walk Your Plans, 3300 1st Ave S, Seattle",
  description: "Know Your Rights workshop with Lakay Toussaint Community Alliance and the Northwest Immigrant Rights Project. Haitian Creole interpretation available. In-person or Zoom attendance.",
};

export type AttendanceMode = "in-person" | "zoom";

export function calendarLocation(mode: AttendanceMode) {
  return mode === "in-person"
    ? KNOW_YOUR_RIGHTS_CALENDAR.address
    : "Zoom — details will be sent by email";
}

export function escapeIcsValue(value: string) {
  return value.replace(/[\\;,\n\r]/g, (match) => {
    if (match === "\\") return "\\\\";
    if (match === ";") return "\\;";
    if (match === ",") return "\\,";
    return "\\n";
  });
}

/** Fold content lines at 75 UTF-8 octets as required by RFC 5545. */
export function foldIcsLine(line: string) {
  const chunks: string[] = [];
  let chunk = "";
  let chunkBytes = 0;
  for (const character of line) {
    const characterBytes = new TextEncoder().encode(character).length;
    const limit = chunks.length ? 74 : 75;
    if (chunk && chunkBytes + characterBytes > limit) {
      chunks.push(chunk);
      chunk = "";
      chunkBytes = 0;
    }
    chunk += character;
    chunkBytes += characterBytes;
  }
  if (chunk || !chunks.length) chunks.push(chunk);
  return chunks.map((part, index) => index === 0 ? part : ` ${part}`);
}

export function buildKnowYourRightsIcs(mode: AttendanceMode) {
  const location = calendarLocation(mode);
  const uid = "know-your-rights-20261017@lakaytoussaint.org";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lakay Toussaint Community Alliance//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    // Deterministic publication timestamp keeps generated files stable and cacheable.
    "DTSTAMP:20260101T000000Z",
    `DTSTART:${KNOW_YOUR_RIGHTS_CALENDAR.startUtc}`,
    `DTEND:${KNOW_YOUR_RIGHTS_CALENDAR.endUtc}`,
    `SUMMARY:${escapeIcsValue(KNOW_YOUR_RIGHTS_CALENDAR.title)}`,
    `DESCRIPTION:${escapeIcsValue(`${KNOW_YOUR_RIGHTS_CALENDAR.description} ${location}`)}`,
    `LOCATION:${escapeIcsValue(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.flatMap(foldIcsLine).join("\r\n")}\r\n`;
}
