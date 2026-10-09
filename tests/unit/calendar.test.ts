import { describe, expect, it } from "vitest";
import { buildKnowYourRightsIcs, escapeIcsValue, foldIcsLine } from "@/lib/events/calendar";

describe("event calendar generation", () => {
  it("escapes RFC 5545 text values", () => {
    expect(escapeIcsValue("one, two; three\\four\nfive")).toBe("one\\, two\\; three\\\\four\\nfive");
  });

  it("folds long lines without exceeding the octet limit", () => {
    const folded = foldIcsLine(`DESCRIPTION:${"Ayiti ".repeat(30)}`);
    expect(folded.length).toBeGreaterThan(1);
    expect(folded.slice(1).every((line) => line.startsWith(" "))).toBe(true);
    expect(folded.every((line) => Buffer.byteLength(line) <= 75)).toBe(true);
  });

  it("builds mode-specific calendar files", () => {
    const inPerson = buildKnowYourRightsIcs("in-person");
    const zoom = buildKnowYourRightsIcs("zoom");

    expect(inPerson).toContain("BEGIN:VCALENDAR\r\n");
    expect(inPerson).toContain("Walk Your Plans");
    expect(zoom).toContain("Zoom");
    expect(zoom).toContain("END:VCALENDAR\r\n");
  });
});
