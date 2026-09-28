import type {
  RegistrationInput,
  RegistrationValidationResult,
} from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9 ()-]{7,24}$/;
export const DEFAULT_MAX_PARTY_SIZE = 5;

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function validateRegistration(
  value: unknown,
  maxPartySize = DEFAULT_MAX_PARTY_SIZE,
): RegistrationValidationResult {
  const input = (value && typeof value === "object" ? value : {}) as Record<
    string,
    unknown
  >;
  const data: RegistrationInput = {
    firstName: text(input.firstName, 80),
    lastName: text(input.lastName, 80),
    email: text(input.email, 254).toLowerCase(),
    attendeeCount: Number(input.attendeeCount),
    whatsappPhone: text(input.whatsappPhone, 30),
    whatsappOptIn: input.whatsappOptIn === true,
  };
  const errors: RegistrationValidationResult["errors"] = {};

  if (!data.firstName) {
    errors.firstName = "Please enter your first name.";
  }

  if (!EMAIL_PATTERN.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (
    !Number.isInteger(data.attendeeCount) ||
    data.attendeeCount < 1 ||
    data.attendeeCount > maxPartySize
  ) {
    errors.attendeeCount = `Party size must be between 1 and ${maxPartySize}.`;
  }

  if (data.whatsappPhone && !PHONE_PATTERN.test(data.whatsappPhone)) {
    errors.whatsappPhone = "Please enter a valid WhatsApp phone number.";
  }

  if (data.whatsappPhone && !data.whatsappOptIn) {
    errors.whatsappOptIn = "Consent is required to receive WhatsApp event updates.";
  }

  return Object.keys(errors).length ? { errors } : { data, errors };
}
