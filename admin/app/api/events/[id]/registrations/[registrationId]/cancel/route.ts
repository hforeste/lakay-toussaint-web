import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { cancelAdminRegistration, EventNotFoundError, RegistrationNotFoundError } from "@/lib/registrations-mutations";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(_request: Request, { params }: { params: Promise<{ id: string; registrationId: string }> }) {
  if (!(await isAuthenticated())) return json({ error: "Unauthorized" }, 401);
  const values = await params;
  try {
    const registration = await cancelAdminRegistration(values.id, values.registrationId);
    return json({ registration });
  } catch (error) {
    if (error instanceof EventNotFoundError || error instanceof RegistrationNotFoundError) return json({ error: "Registration not found." }, 404);
    console.error("Admin registration cancellation failed.");
    return json({ error: "The registration could not be cancelled." }, 500);
  }
}
