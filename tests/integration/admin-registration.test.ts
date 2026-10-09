import { beforeEach, describe, expect, it } from "vitest";
import {
  cancelAdminRegistration,
  CapacityError,
  createAdminRegistration,
  DuplicateRegistrationError,
  updateAdminRegistration,
} from "../../admin/lib/registrations-mutations";
import { queryRegistrations } from "../../admin/lib/registrations-query";
import { insertTestEvent, resetTestData } from "../support/test-database";

beforeEach(async () => {
  await resetTestData();
});

describe("admin registration operations", () => {
  it("creates, searches, edits, and cancels a registration", async () => {
    const event = await insertTestEvent({ capacity: 5 });
    const created = await createAdminRegistration(event.id, {
      firstName: "Jean",
      lastName: "Baptiste",
      email: "jean@example.com",
      phone: "+1 206 555 0102",
      attendeeCount: 2,
      attendanceMode: "in-person",
    });

    const searched = await queryRegistrations(event.id, {
      search: "baptiste",
      status: "all",
      attendanceMode: "all",
      sort: "name",
      direction: "asc",
    });
    expect(searched?.registrations.map((item) => item.id)).toEqual([created.id]);
    expect(searched?.summary.registeredAttendees).toBe(2);

    const updated = await updateAdminRegistration(event.id, created.id, { attendeeCount: 3 });
    expect(updated.attendeeCount).toBe(3);

    const cancelled = await cancelAdminRegistration(event.id, created.id);
    expect(cancelled.status).toBe("cancelled");
    const afterCancel = await queryRegistrations(event.id);
    expect(afterCancel?.summary.registeredAttendees).toBe(0);
    expect(afterCancel?.summary.cancelledRegistrationCount).toBe(1);
  });

  it("rejects duplicate emails and capacity overflow", async () => {
    const event = await insertTestEvent({ capacity: 2 });
    await createAdminRegistration(event.id, {
      firstName: "Jean", email: "jean@example.com", attendeeCount: 1,
    });

    await expect(createAdminRegistration(event.id, {
      firstName: "Other", email: "JEAN@example.com", attendeeCount: 1,
    })).rejects.toBeInstanceOf(DuplicateRegistrationError);
    await expect(createAdminRegistration(event.id, {
      firstName: "Marie", email: "marie@example.com", attendeeCount: 2,
    })).rejects.toBeInstanceOf(CapacityError);
  });
});
