import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { CapacityError, createAdminRegistration, DuplicateRegistrationError, EventNotFoundError, RegistrationValidationError } from "@/lib/registrations-mutations";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return json({ error: "Unauthorized" }, 401);
  try {
    const registration = await createAdminRegistration((await params).id, await request.json());
    return json({ registration }, 201);
  } catch (error) {
    if (error instanceof RegistrationValidationError) return json({ error: error.message }, 400);
    if (error instanceof EventNotFoundError) return json({ error: "Event not found." }, 404);
    if (error instanceof DuplicateRegistrationError) return json({ error: "A confirmed registration already uses that email." }, 409);
    if (error instanceof CapacityError) return json({ error: "The requested party size does not fit this event." }, 409);
    console.error("Admin registration creation failed.");
    return json({ error: "The registration could not be created." }, 500);
  }
}
