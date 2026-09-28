import { DatabaseConfigurationError } from "@/lib/database";
import { sendCancellationConfirmation } from "@/lib/events/email";
import { cancelEventRegistration } from "@/lib/events/repository";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    let payload: { token?: unknown };
    try {
      payload = (await request.json()) as { token?: unknown };
    } catch {
      return Response.json(
        { ok: false, message: "The cancellation request must contain valid JSON." },
        { status: 400 },
      );
    }
    const token = typeof payload.token === "string" ? payload.token : "";
    const registration = await cancelEventRegistration(slug, token);

    if (!registration) {
      return Response.json(
        { ok: false, message: "This registration is already cancelled or the link is invalid." },
        { status: 404 },
      );
    }

    let emailSent = true;
    try {
      await sendCancellationConfirmation(registration);
    } catch (error) {
      emailSent = false;
      console.error("Cancellation confirmation email failed.", error);
    }

    return Response.json({
      ok: true,
      emailSent,
      message: "Your registration has been cancelled.",
    });
  } catch (error) {
    if (error instanceof DatabaseConfigurationError) {
      return Response.json(
        { ok: false, message: "Event registration is not configured yet." },
        { status: 503 },
      );
    }

    console.error("Event cancellation failed.", error);
    return Response.json(
      { ok: false, message: "The registration could not be cancelled. Please try again." },
      { status: 500 },
    );
  }
}
