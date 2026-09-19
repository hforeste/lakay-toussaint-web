import { DatabaseConfigurationError } from "@/lib/database";
import { sendRegistrationConfirmation } from "@/lib/events/email";
import {
  createEventRegistration,
  DuplicateRegistrationError,
  getPublishedEventBySlug,
  RegistrationCapacityError,
  RegistrationClosedError,
  RegistrationRateLimitError,
} from "@/lib/events/repository";
import { validateRegistration } from "@/lib/events/validation";

function clientIp(request: Request) {
  return (
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const event = await getPublishedEventBySlug(slug);

    if (!event) {
      return Response.json({ ok: false, message: "Event not found." }, { status: 404 });
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return Response.json(
        { ok: false, message: "The registration request must contain valid JSON." },
        { status: 400 },
      );
    }

    const validation = validateRegistration(payload, event.maxPartySize);
    if (!validation.data) {
      return Response.json(
        { ok: false, message: "Please correct the highlighted fields.", errors: validation.errors },
        { status: 422 },
      );
    }

    const registration = await createEventRegistration({
      slug,
      input: validation.data,
      ipAddress: clientIp(request),
    });

    let emailSent = true;
    try {
      const emailResult = await sendRegistrationConfirmation(registration);
      emailSent = !("skipped" in emailResult && emailResult.skipped);
    } catch (error) {
      emailSent = false;
      console.error("Registration confirmation email failed.", error);
    }

    return Response.json(
      {
        ok: true,
        emailSent,
        message: emailSent
          ? "Your registration is confirmed. Check your email for the details."
          : "Your registration is confirmed, but we could not send the confirmation email.",
        ...(process.env.NODE_ENV !== "production"
          ? {
              cancellationUrl: `/events/${encodeURIComponent(slug)}/registration/cancel?token=${encodeURIComponent(registration.cancellationToken)}`,
            }
          : {}),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof RegistrationRateLimitError) {
      return Response.json(
        { ok: false, message: "Too many registration attempts. Please try again in 15 minutes." },
        { status: 429 },
      );
    }
    if (error instanceof DuplicateRegistrationError) {
      return Response.json(
        { ok: false, message: "This email is already registered for the event." },
        { status: 409 },
      );
    }
    if (error instanceof RegistrationCapacityError) {
      return Response.json(
        { ok: false, message: "There are not enough remaining spaces for that party size." },
        { status: 409 },
      );
    }
    if (error instanceof RegistrationClosedError) {
      return Response.json(
        { ok: false, message: "Registration is not currently available for this event." },
        { status: 409 },
      );
    }
    if (error instanceof DatabaseConfigurationError) {
      return Response.json(
        { ok: false, message: "Event registration is not configured yet." },
        { status: 503 },
      );
    }

    console.error("Event registration failed.", error);
    return Response.json(
      { ok: false, message: "Registration could not be completed. Please try again." },
      { status: 500 },
    );
  }
}
