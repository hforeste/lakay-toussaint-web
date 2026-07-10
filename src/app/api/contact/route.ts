import { createContactSubmission } from "@/lib/submissions/contact";
import { isEmail, requireString, validationError } from "@/lib/validation";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = requireString(formData, "name");
  const email = requireString(formData, "email");
  const reason = requireString(formData, "reason");
  const message = requireString(formData, "message");
  const fieldErrors: Record<string, string> = {};

  if (!name) {
    fieldErrors.name = "Please enter your name.";
  }

  if (!email) {
    fieldErrors.email = "Please enter your email address.";
  } else if (!isEmail(email)) {
    fieldErrors.email = "Please enter a valid email address.";
  }

  if (!reason) {
    fieldErrors.reason = "Please select a reason for contact.";
  }

  if (!message) {
    fieldErrors.message = "Please enter a message.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return Response.json(
      {
        ok: false,
        message: "Please complete all required fields.",
        fieldErrors,
      },
      { status: 422 },
    );
  }

  try {
    await createContactSubmission({
      name,
      email,
      reason,
      message,
      newsletterOptIn: formData.get("newsletterOptIn") === "on",
    });
    return Response.json({
      ok: true,
      message: "Thank you. Your message has been received.",
    });
  } catch {
    return validationError(
      "Contact submissions are not configured yet. Please email us directly.",
      503,
    );
  }
}
