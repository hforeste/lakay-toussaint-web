import { afterEach, describe, expect, it, vi } from "vitest";
import { sendCancellationConfirmation, sendRegistrationConfirmation } from "@/lib/events/email";
import type { PublicEvent } from "@/lib/events/types";

const event: PublicEvent = {
  id: "event-1",
  slug: "community-event",
  title: "Community <Gathering>",
  subtitle: null,
  startsAt: new Date("2099-06-15T18:00:00.000Z"),
  endsAt: new Date("2099-06-15T21:00:00.000Z"),
  timeZone: "America/Los_Angeles",
  locationName: "Test & Community Center",
  locationAddress: "100 Test Ave",
  summary: "Summary",
  description: "Description",
  heroImageUrl: null,
  capacity: 10,
  registeredAttendees: 2,
  registrationOpensAt: null,
  registrationClosesAt: null,
  maxPartySize: 5,
  registrationAvailable: true,
  hasEnded: false,
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("registration email delivery", () => {
  it("skips delivery without development credentials", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("REGISTRATION_EMAIL_FROM", "");
    vi.spyOn(console, "info").mockImplementation(() => undefined);

    await expect(sendRegistrationConfirmation({
      registrationId: "registration-1",
      email: "marie@example.com",
      firstName: "Marie",
      attendeeCount: 2,
      event,
      cancellationToken: "cancel-token",
    })).resolves.toEqual({ skipped: true });
  });

  it("sends escaped confirmation content with an idempotency key", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("REGISTRATION_EMAIL_FROM", "Events <events@example.com>");
    vi.stubEnv("APP_URL", "https://example.org");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ id: "message-1" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ));

    await sendRegistrationConfirmation({
      registrationId: "registration-1",
      email: "marie@example.com",
      firstName: "Marie <Admin>",
      attendeeCount: 2,
      event,
      cancellationToken: "cancel token",
    });

    const [, request] = fetchMock.mock.calls[0];
    const body = JSON.parse(String((request as RequestInit).body));
    expect((request as RequestInit).headers).toMatchObject({
      "Idempotency-Key": "registration-confirmed-registration-1",
    });
    expect(body.to).toEqual(["marie@example.com"]);
    expect(body.html).toContain("Marie &lt;Admin&gt;");
    expect(body.html).toContain("Community &lt;Gathering&gt;");
    expect(body.html).toContain("cancel%20token");
  });

  it("uses a separate idempotency key for cancellation", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("REGISTRATION_EMAIL_FROM", "Events <events@example.com>");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ id: "message-2" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ));

    await sendCancellationConfirmation({
      registrationId: "registration-1",
      email: "marie@example.com",
      firstName: "Marie",
      attendeeCount: 2,
      eventTitle: "Community Gathering",
    });

    expect((fetchMock.mock.calls[0][1] as RequestInit).headers).toMatchObject({
      "Idempotency-Key": "registration-cancelled-registration-1",
    });
  });
});
