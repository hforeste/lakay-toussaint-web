import { submitToCollection } from "../firebase";
import { subscribeToNewsletter } from "./newsletter";

export const CONTACT_SUBMISSIONS_COLLECTION = "contactSubmissions";

export type ContactSubmissionInput = {
  name: string;
  email: string;
  reason: string;
  message: string;
  newsletterOptIn?: boolean;
};

export async function createContactSubmission(input: ContactSubmissionInput): Promise<string> {
  const docRef = await submitToCollection(CONTACT_SUBMISSIONS_COLLECTION, {
    name: input.name,
    email: input.email.toLowerCase(),
    reason: input.reason,
    message: input.message,
    newsletterOptIn: Boolean(input.newsletterOptIn),
    status: "new",
    source: "website",
  });

  if (input.newsletterOptIn) {
    const newsletterResult = await subscribeToNewsletter({
      email: input.email,
      firstName: input.name,
      fields: {
        source: "contact-form",
      },
    });

    if (!newsletterResult.ok) {
      console.warn("Kit newsletter subscription failed for contact submission", newsletterResult.error);
    }
  }

  return docRef.id;
}
