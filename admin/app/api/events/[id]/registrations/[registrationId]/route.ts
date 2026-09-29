import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { CapacityError, DuplicateRegistrationError, EventNotFoundError, RegistrationNotFoundError, RegistrationValidationError, updateAdminRegistration } from "@/lib/registrations-mutations";
import { getRegistration } from "@/lib/registrations-query";
import { recordAudit } from "@/lib/audit";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; registrationId: string }> }) {
  if (!(await isAuthenticated())) return json({ error: "Unauthorized" }, 401);
  const values = await params;
  const result = await getRegistration(values.id, values.registrationId);
  if (!result) return json({ error: "Registration not found." }, 404);
  await recordAudit("registration.view", { eventId: values.id, registrationId: values.registrationId });
  return json(result);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; registrationId: string }> }) {
  if (!(await isAuthenticated())) return json({ error: "Unauthorized" }, 401);
  const values = await params;
  try {
    const registration = await updateAdminRegistration(values.id, values.registrationId, await request.json());
    await recordAudit("registration.update", { eventId: values.id, registrationId: values.registrationId }, { attendeeCount: registration.attendeeCount, status: registration.status });
    return json({ registration });
  } catch (error) {
    if (error instanceof RegistrationValidationError) return json({ error: error.message }, 400);
    if (error instanceof EventNotFoundError || error instanceof RegistrationNotFoundError) return json({ error: "Registration not found." }, 404);
    if (error instanceof DuplicateRegistrationError) return json({ error: "A confirmed registration already uses that email." }, 409);
    if (error instanceof CapacityError) return json({ error: "The requested party size does not fit this event." }, 409);
    console.error("Admin registration update failed.");
    return json({ error: "The registration could not be updated." }, 500);
  }
}
