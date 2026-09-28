import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { deleteEvent, parseEventInput, updateEvent } from "@/lib/events";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = parseEventInput(await request.json());
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const event = await updateEvent((await params).id, parsed.data);
    return event
      ? NextResponse.json({ event })
      : NextResponse.json({ error: "Event not found." }, { status: 404 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("events_slug_key")) {
      return NextResponse.json({ error: "That event slug is already in use." }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const deleted = await deleteEvent((await params).id);
  return deleted
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Event not found." }, { status: 404 });
}
