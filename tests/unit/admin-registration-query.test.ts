import { describe, expect, it } from "vitest";
import { csvCell, parseRegistrationFilters, registrationsCsv } from "../../admin/lib/registrations-query";
import type { AdminRegistration } from "../../admin/lib/registration-types";

describe("admin registration query helpers", () => {
  it("normalizes filters and rejects unsupported values", () => {
    expect(parseRegistrationFilters({
      search: `  ${"x".repeat(120)}  `,
      status: "unknown",
      attendanceMode: "zoom",
      sort: "partySize",
      direction: "asc",
    })).toEqual({
      search: "x".repeat(100),
      status: "all",
      attendanceMode: "zoom",
      sort: "partySize",
      direction: "asc",
    });
  });

  it("guards exported CSV cells against spreadsheet formulas", () => {
    expect(csvCell("=HYPERLINK(\"bad\")")).toBe("\"'=HYPERLINK(\"\"bad\"\")\"");
    expect(csvCell("Toussaint, Marie")).toBe("\"Toussaint, Marie\"");
  });

  it("exports an explicit registration roster", () => {
    const registration: AdminRegistration = {
      id: "registration-1", eventId: "event-1", firstName: "Marie", lastName: "Toussaint",
      email: "marie@example.com", phone: "+12065550100", whatsappPhone: "", whatsappOptIn: false,
      attendeeCount: 2, status: "confirmed", createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z", cancelledAt: "", dateOfBirth: "", gender: "",
      city: "Seattle", county: "King", attendanceMode: "in-person", accommodations: "",
      mediaAcknowledgement: true,
    };

    const csv = registrationsCsv([registration]);
    expect(csv).toContain("\"Name\",\"Email\"");
    expect(csv).toContain("\"Marie Toussaint\",\"marie@example.com\"");
    expect(csv.endsWith("\r\n")).toBe(true);
  });
});
