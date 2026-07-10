export type FieldErrors = Record<string, string>;

export type ContactSubmissionInput = {
  name: string;
  email: string;
  message: string;
  subject?: string;
  phone?: string;
  newsletterOptIn?: boolean;
};

export type BusinessSubmissionInput = {
  businessName: string;
  contactName: string;
  email: string;
  message: string;
  businessType?: string;
  phone?: string;
  website?: string;
  newsletterOptIn?: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(formData: FormData, key: string): boolean {
  const value = formData.get(key);

  return value === "true" || value === "on" || value === "1";
}

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

export function contactInputFromFormData(formData: FormData): ContactSubmissionInput {
  return {
    name: readString(formData, "name"),
    email: readString(formData, "email"),
    message: readString(formData, "message"),
    subject: readString(formData, "subject"),
    phone: readString(formData, "phone"),
    newsletterOptIn: readBoolean(formData, "newsletterOptIn"),
  };
}

export function businessInputFromFormData(formData: FormData): BusinessSubmissionInput {
  return {
    businessName: readString(formData, "businessName"),
    contactName: readString(formData, "contactName"),
    email: readString(formData, "email"),
    message: readString(formData, "message"),
    businessType: readString(formData, "businessType"),
    phone: readString(formData, "phone"),
    website: readString(formData, "website"),
    newsletterOptIn: readBoolean(formData, "newsletterOptIn"),
  };
}

export function validateContactSubmission(input: ContactSubmissionInput): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.name) {
    errors.name = "Please enter your name.";
  }

  if (!input.email) {
    errors.email = "Please enter your email address.";
  } else if (!isValidEmail(input.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!input.message) {
    errors.message = "Please enter a message.";
  }

  return errors;
}

export function validateBusinessSubmission(input: BusinessSubmissionInput): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.businessName) {
    errors.businessName = "Please enter your business name.";
  }

  if (!input.contactName) {
    errors.contactName = "Please enter a contact name.";
  }

  if (!input.email) {
    errors.email = "Please enter your email address.";
  } else if (!isValidEmail(input.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!input.message) {
    errors.message = "Please share how you would like to partner.";
  }

  return errors;
}
