import { isValidEmail } from "./validation";

export type NewsletterSubscribeInput = {
  email: string;
  firstName?: string;
  fields?: Record<string, string>;
};

export type NewsletterSubscribeResult =
  | { ok: true; skipped?: false }
  | { ok: true; skipped: true; reason: "missing_config" | "invalid_email" }
  | { ok: false; error: string };

function getKitConfig() {
  const apiKey = process.env.KIT_API_KEY ?? process.env.CONVERTKIT_API_KEY;
  const formId = process.env.KIT_FORM_ID ?? process.env.CONVERTKIT_FORM_ID;
  const formAction = process.env.KIT_FORM_ACTION ?? process.env.NEXT_PUBLIC_KIT_FORM_ACTION;

  if (formAction) {
    return { type: "form_action" as const, formAction };
  }

  if (!apiKey || !formId) {
    return null;
  }

  return { type: "api" as const, apiKey, formId };
}

export async function subscribeToNewsletter(input: NewsletterSubscribeInput): Promise<NewsletterSubscribeResult> {
  if (!input.email || !isValidEmail(input.email)) {
    return { ok: true, skipped: true, reason: "invalid_email" };
  }

  const config = getKitConfig();

  if (!config) {
    return { ok: true, skipped: true, reason: "missing_config" };
  }

  try {
    const response =
      config.type === "form_action"
        ? await fetch(config.formAction, {
            method: "POST",
            body: kitFormData(input),
          })
        : await fetch(`https://api.convertkit.com/v3/forms/${config.formId}/subscribe`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              api_key: config.apiKey,
              email: input.email,
              first_name: input.firstName,
              fields: input.fields,
            }),
          });

    if (!response.ok) {
      const errorText = await response.text();

      return { ok: false, error: errorText || "Kit subscription request failed." };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Kit subscription request failed.",
    };
  }
}

function kitFormData(input: NewsletterSubscribeInput): FormData {
  const formData = new FormData();

  formData.set("email_address", input.email);

  if (input.firstName) {
    formData.set("fields[first_name]", input.firstName);
  }

  for (const [key, value] of Object.entries(input.fields ?? {})) {
    formData.set(`fields[${key}]`, value);
  }

  return formData;
}
