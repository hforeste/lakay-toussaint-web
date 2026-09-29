import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { deleteEvent, parseEventInput, updateEvent } from "@/lib/events";
import { recordAudit } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = parseEventInput(await request.json());
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const event = await updateEvent((await params).id, parsed.data);
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    await recordAudit("event.update", { eventId: event.id }, { status: event.status });
    return NextResponse.json({ event });
  } catch (error) {
    if (error instanceof Error && error.message.includes("events_slug_key")) {
      return NextResponse.json({ error: "That event slug is already in use." }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const deleted = await deleteEvent(id);
  if (!deleted) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  await recordAudit("event.delete", { eventId: id }, { deletedEventId: id });
  return NextResponse.json({ ok: true });
}
