import { describe, expect, it } from "vitest";
import { validateRegistration } from "@/lib/events/validation";

const validRegistration = {
  firstName: "  Marie  ",
  lastName: "Toussaint",
  email: " MARIE@EXAMPLE.COM ",
  phone: "+1 206 555 0100",
  attendeeCount: 2,
  whatsappPhone: "+1 206 555 0101",
  whatsappOptIn: true,
};

describe("validateRegistration", () => {
  it("normalizes a valid standard registration", () => {
    const result = validateRegistration(validRegistration, 5);

    expect(result.errors).toEqual({});
    expect(result.data).toMatchObject({
      firstName: "Marie",
      email: "marie@example.com",
      attendeeCount: 2,
    });
  });

  it("rejects invalid contact data and party sizes", () => {
    const result = validateRegistration({
      firstName: "",
      email: "not-an-email",
      phone: "12",
      attendeeCount: 4,
      whatsappPhone: "+1 206 555 0101",
      whatsappOptIn: false,
    }, 3);

    expect(result.data).toBeUndefined();
    expect(result.errors).toMatchObject({
      firstName: expect.any(String),
      email: expect.any(String),
      phone: expect.any(String),
      attendeeCount: expect.any(String),
      whatsappOptIn: expect.any(String),
    });
  });

  it("requires campaign-specific fields for Know Your Rights", () => {
    const result = validateRegistration(validRegistration, 5, {
      requireKnowYourRightsFields: true,
    });

    expect(result.errors).toMatchObject({
      dateOfBirth: expect.any(String),
      gender: expect.any(String),
      city: expect.any(String),
      county: expect.any(String),
      attendanceMode: expect.any(String),
      mediaAcknowledgement: expect.any(String),
    });
  });

  it("accepts a complete campaign registration", () => {
    const result = validateRegistration({
      ...validRegistration,
      dateOfBirth: "1990-05-20",
      gender: "prefer-not-to-say",
      city: "Seattle",
      county: "King",
      attendanceMode: "zoom",
      mediaAcknowledgement: true,
    }, 5, { requireKnowYourRightsFields: true });

    expect(result.errors).toEqual({});
    expect(result.data?.attendanceMode).toBe("zoom");
  });
});
