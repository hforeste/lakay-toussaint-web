import { createBusinessSubmission } from "@/lib/submissions/business";
import { isEmail, requireString, validationError } from "@/lib/validation";

export async function POST(request: Request) {
  const formData = await request.formData();
  const businessName = requireString(formData, "businessName");
  const contactName = requireString(formData, "contactName");
  const email = requireString(formData, "email");
  const category = requireString(formData, "category");
  const description = requireString(formData, "description");
  const consent = formData.get("consent") === "on";
  const fieldErrors: Record<string, string> = {};

  if (!businessName) {
    fieldErrors.businessName = "Please enter the business name.";
  }

  if (!contactName) {
    fieldErrors.contactName = "Please enter the owner or contact name.";
  }

  if (!email) {
    fieldErrors.email = "Please enter an email address.";
  } else if (!isEmail(email)) {
    fieldErrors.email = "Please enter a valid email address.";
  }

  if (!category) {
    fieldErrors.category = "Please enter a business category.";
  }

  if (!description) {
    fieldErrors.description = "Please enter a business description.";
  }

  if (!consent) {
    fieldErrors.consent = "Please confirm LTCA may contact you about this listing.";
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
    await createBusinessSubmission({
      businessName,
      contactName,
      email,
      phone: requireString(formData, "phone"),
      category,
      description,
      location: requireString(formData, "location"),
      website: requireString(formData, "website"),
      socialLinks: requireString(formData, "socialLinks"),
      haitianOwnedOrServing: formData.get("haitianOwnedOrServing") === "on",
      notes: requireString(formData, "notes"),
      consent,
      newsletterOptIn: formData.get("newsletterOptIn") === "on",
    });
    return Response.json({
      ok: true,
      message:
        "Thank you. LTCA will review your submission before adding it to the public directory.",
    });
  } catch {
    return validationError(
      "Business submissions are not configured yet. Please contact LTCA directly.",
      503,
    );
  }
}
