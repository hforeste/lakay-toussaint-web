import { submitToCollection } from "../firebase";
import { subscribeToNewsletter } from "./newsletter";

export const BUSINESS_SUBMISSIONS_COLLECTION = "businessSubmissions";

export type BusinessSubmissionInput = {
  businessName: string;
  contactName: string;
  email: string;
  category: string;
  description: string;
  phone?: string;
  location?: string;
  website?: string;
  socialLinks?: string;
  haitianOwnedOrServing?: boolean;
  notes?: string;
  consent: boolean;
  newsletterOptIn?: boolean;
};

export async function createBusinessSubmission(input: BusinessSubmissionInput): Promise<string> {
  const docRef = await submitToCollection(BUSINESS_SUBMISSIONS_COLLECTION, {
    businessName: input.businessName,
    contactName: input.contactName,
    email: input.email.toLowerCase(),
    category: input.category,
    description: input.description,
    phone: input.phone || null,
    location: input.location || null,
    website: input.website || null,
    socialLinks: input.socialLinks || null,
    haitianOwnedOrServing: Boolean(input.haitianOwnedOrServing),
    notes: input.notes || null,
    consent: input.consent,
    newsletterOptIn: Boolean(input.newsletterOptIn),
    status: "new",
    source: "website",
  });

  if (input.newsletterOptIn) {
    const newsletterResult = await subscribeToNewsletter({
      email: input.email,
      firstName: input.contactName,
      fields: {
        source: "business-form",
        business_name: input.businessName,
      },
    });

    if (!newsletterResult.ok) {
      console.warn("Kit newsletter subscription failed for business submission", newsletterResult.error);
    }
  }

  return docRef.id;
}
