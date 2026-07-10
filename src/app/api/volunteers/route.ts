import { submitToCollection } from "@/lib/firebase";
import { isEmail, requireString, validationError } from "@/lib/validation";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = requireString(formData, "name");
  const email = requireString(formData, "email");

  if (!name || !email) {
    return validationError("Please enter your name and email.");
  }

  if (!isEmail(email)) {
    return validationError("Please enter a valid email address.");
  }

  try {
    await submitToCollection("volunteers", {
      name,
      email,
      phone: requireString(formData, "phone"),
      interests: formData.getAll("interests").map(String),
      skills: requireString(formData, "skills"),
      availability: requireString(formData, "availability"),
      message: requireString(formData, "message"),
    });
    return Response.json({
      ok: true,
      message: "Thank you. LTCA will follow up about volunteer opportunities.",
    });
  } catch {
    return validationError(
      "Volunteer submissions are not configured yet. Please contact LTCA directly.",
      503,
    );
  }
}
