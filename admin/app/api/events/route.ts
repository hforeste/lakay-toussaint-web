import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { createEvent, listEvents, parseEventInput } from "@/lib/events";
import { recordAudit } from "@/lib/audit";

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ events: await listEvents() });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = parseEventInput(await request.json());
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const event = await createEvent(parsed.data);
    await recordAudit("event.create", { eventId: event.id }, { status: event.status });
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("events_slug_key")) {
      return NextResponse.json({ error: "That event slug is already in use." }, { status: 409 });
    }
    throw error;
  }
}
