import { subscribeToNewsletter } from "@/lib/submissions/newsletter";
import { isEmail, requireString, validationError } from "@/lib/validation";

export async function POST(request: Request) {
  const formData = await request.formData();
  const firstName = requireString(formData, "firstName");
  const email = requireString(formData, "email");
  const fieldErrors: Record<string, string> = {};

  if (!firstName) {
    fieldErrors.firstName = "Please enter your first name.";
  }

  if (!email) {
    fieldErrors.email = "Please enter your email address.";
  } else if (!isEmail(email)) {
    fieldErrors.email = "Please enter a valid email address.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return Response.json(
      {
        ok: false,
        message: "Please enter your first name and email.",
        fieldErrors,
      },
      { status: 422 },
    );
  }

  const result = await subscribeToNewsletter({
    email,
    firstName,
    fields: {
      source: "newsletter-form",
    },
  });

  if (!result.ok) {
    return validationError("Newsletter signup failed. Please try again.", 502);
  }

  if (result.skipped && result.reason === "missing_config") {
    return Response.json(
      {
        ok: true,
        message:
          "Thank you for joining the LTCA email list. Newsletter delivery is not configured yet.",
      },
      { status: 202 },
    );
  }

  return Response.json({
    ok: true,
    message: "Thank you for joining the LTCA email list.",
  });
}
