import { requireEditor, getAdminDb } from "@/lib/firebase-admin";

type EventStatus = "draft" | "published" | "archived";

interface AdminEventPayload {
  id?: string;
  slug: string;
  title: string;
  subtitle?: string;
  startsAt: string;
  endsAt?: string;
  locationName: string;
  locationAddress: string;
  neighborhood?: string;
  googleMapsUrl?: string;
  googleMapsEmbedUrl?: string;
  summary: string;
  description: string;
  heroImageUrl?: string;
  ticketUrl?: string;
  rsvpUrl: string;
  ticketCtaLabel?: string;
  isFree?: boolean;
  expectedAttendeeCount?: number;
  attendeeCountLabel?: string;
  whatsappShareText?: string;
  instagramCaption?: string;
  tiktokCaption?: string;
  highlights?: Array<{ title: string; description: string }>;
  scheduleItems?: Array<{ time: string; title: string; description?: string }>;
  faqItems?: Array<{ question: string; answer: string }>;
  status: EventStatus;
  isFeatured?: boolean;
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
  const subtitle = clean(payload.subtitle);
  const startsAt = clean(payload.startsAt);
  const endsAt = clean(payload.endsAt);
  const locationName = clean(payload.locationName);
  const locationAddress = clean(payload.locationAddress);
  const neighborhood = clean(payload.neighborhood);
  const googleMapsUrl = clean(payload.googleMapsUrl);
  const googleMapsEmbedUrl = clean(payload.googleMapsEmbedUrl);
  const summary = clean(payload.summary);
  const description = clean(payload.description);
  const heroImageUrl = clean(payload.heroImageUrl);
  const ticketUrl = clean(payload.ticketUrl);
  const rsvpUrl = clean(payload.rsvpUrl);
  const ticketCtaLabel = clean(payload.ticketCtaLabel);
  const status = payload.status || "draft";
  const expectedAttendeeCount = Number.isFinite(Number(payload.expectedAttendeeCount))
    ? Number(payload.expectedAttendeeCount)
    : undefined;
  const attendeeCountLabel = clean(payload.attendeeCountLabel);
  const order = Number.isFinite(Number(payload.order)) ? Number(payload.order) : 0;

  if (!title || !slug || !startsAt || !locationName || !summary || !description) {
    throw new ValidationError(
      "Title, slug, date/time, location name, summary, and description are required.",
    );
  }

  if (!allowedStatuses.has(status)) {
    throw new ValidationError("Event status must be draft, published, or archived.");
  }

  const event: AdminEventPayload = {
    id: clean(payload.id) || slug,
    slug,
    title,
    subtitle,
    startsAt,
    endsAt,
    locationName,
    locationAddress,
    neighborhood,
    googleMapsUrl,
    googleMapsEmbedUrl,
    summary,
    description,
    heroImageUrl,
    ticketUrl,
    rsvpUrl,
    ticketCtaLabel,
    isFree: Boolean(payload.isFree),
    expectedAttendeeCount,
    attendeeCountLabel,
    whatsappShareText: clean(payload.whatsappShareText),
    instagramCaption: clean(payload.instagramCaption),
    tiktokCaption: clean(payload.tiktokCaption),
    highlights: normalizeHighlights(payload.highlights),
    scheduleItems: normalizeScheduleItems(payload.scheduleItems),
    faqItems: normalizeFaqItems(payload.faqItems),
    status,
    isFeatured: Boolean(payload.isFeatured),
    order,
  };

  return removeUndefinedAndEmpty(event);
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeHighlights(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ({
      title: clean(item?.title),
      description: clean(item?.description),
    }))
    .filter((item) => item.title && item.description);
}

function normalizeScheduleItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ({
      time: clean(item?.time),
      title: clean(item?.title),
      description: clean(item?.description),
    }))
    .filter((item) => item.time && item.title);
}

function normalizeFaqItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ({
      question: clean(item?.question),
      answer: clean(item?.answer),
    }))
    .filter((item) => item.question && item.answer);
}

function removeUndefinedAndEmpty<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(([, entry]) => {
      if (entry === undefined || entry === "") {
        return false;
      }

      return !(Array.isArray(entry) && entry.length === 0);
    }),
  ) as unknown as T;
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
