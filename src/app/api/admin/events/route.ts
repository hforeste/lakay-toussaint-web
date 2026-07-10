import { requireEditor, getAdminDb } from "@/lib/firebase-admin";

type EventStatus = "draft" | "published" | "archived";

interface AdminEventPayload {
  id?: string;
  slug: string;
  title: string;
  startsAt: string;
  locationName: string;
  locationAddress: string;
  summary: string;
  description: string;
  rsvpUrl: string;
  status: EventStatus;
  order: number;
}

const allowedStatuses = new Set<EventStatus>(["draft", "published", "archived"]);

export async function GET(request: Request) {
  try {
    await requireEditor(request);
    const snapshot = await getAdminDb()
      .collection("events")
      .orderBy("startsAt", "asc")
      .get();
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return Response.json({ ok: true, events });
  } catch {
    return Response.json(
      { ok: false, message: "Please sign in to manage events." },
      { status: 401 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireEditor(request);
    const payload = await request.json();
    const event = normalizeEvent(payload);
    const docId = event.id || event.slug;

    await getAdminDb().collection("events").doc(docId).set(event);

    return Response.json({
      ok: true,
      event: { id: docId, ...event },
      message: "Event saved.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

export async function DELETE(request: Request) {
  try {
    await requireEditor(request);
    const { id } = (await request.json()) as { id?: string };

    if (!id) {
      return Response.json(
        { ok: false, message: "Event ID is required." },
        { status: 422 },
      );
    }

    await getAdminDb().collection("events").doc(id).delete();

    return Response.json({ ok: true, message: "Event deleted." });
  } catch (error) {
    return errorResponse(error);
  }
}

function normalizeEvent(payload: Partial<AdminEventPayload>): AdminEventPayload {
  const title = clean(payload.title);
  const slug = clean(payload.slug);
  const startsAt = clean(payload.startsAt);
  const locationName = clean(payload.locationName);
  const locationAddress = clean(payload.locationAddress);
  const summary = clean(payload.summary);
  const description = clean(payload.description);
  const rsvpUrl = clean(payload.rsvpUrl);
  const status = payload.status || "draft";
  const order = Number.isFinite(Number(payload.order)) ? Number(payload.order) : 0;

  if (!title || !slug || !startsAt || !locationName || !summary || !description) {
    throw new ValidationError(
      "Title, slug, date/time, location name, summary, and description are required.",
    );
  }

  if (!allowedStatuses.has(status)) {
    throw new ValidationError("Event status must be draft, published, or archived.");
  }

  return {
    id: clean(payload.id) || slug,
    slug,
    title,
    startsAt,
    locationName,
    locationAddress,
    summary,
    description,
    rsvpUrl,
    status,
    order,
  };
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function errorResponse(error: unknown) {
  if (error instanceof ValidationError) {
    return Response.json({ ok: false, message: error.message }, { status: 422 });
  }

  if (error instanceof Error && error.message.includes("token")) {
    return Response.json(
      { ok: false, message: "Please sign in to manage events." },
      { status: 401 },
    );
  }

  return Response.json(
    { ok: false, message: "Event admin request failed." },
    { status: 500 },
  );
}

class ValidationError extends Error {}
