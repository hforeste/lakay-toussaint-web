import type {
  RegistrationInput,
  RegistrationValidationResult,
} from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9 ()-]{7,24}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ATTENDANCE_MODES = new Set(["in-person", "zoom"]);
const GENDER_OPTIONS = new Set(["female", "male", "nonbinary", "other", "prefer-not-to-say"]);
export const DEFAULT_MAX_PARTY_SIZE = 5;

export interface RegistrationValidationOptions {
  requireKnowYourRightsFields?: boolean;
}

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function validateRegistration(
  value: unknown,
  maxPartySize = DEFAULT_MAX_PARTY_SIZE,
  options: RegistrationValidationOptions = {},
): RegistrationValidationResult {
  const input = (value && typeof value === "object" ? value : {}) as Record<
    string,
    unknown
  >;
  const data: RegistrationInput = {
    firstName: text(input.firstName, 80),
    lastName: text(input.lastName, 80),
    email: text(input.email, 254).toLowerCase(),
    phone: text(input.phone, 30),
    attendeeCount: Number(input.attendeeCount),
    // `attendance` is accepted as a campaign-form alias; the canonical API
    // names remain whatsappPhone and attendanceMode. Phone is separate PII.
    whatsappPhone: text(input.whatsappPhone, 30),
    whatsappOptIn: input.whatsappOptIn === true,
    dateOfBirth: text(input.dateOfBirth, 10) || undefined,
    gender: text(input.gender, 60) || undefined,
    city: text(input.city, 120) || undefined,
    county: text(input.county, 120) || undefined,
    attendanceMode: (text(input.attendanceMode ?? input.attendance, 20) || undefined) as RegistrationInput["attendanceMode"],
    accommodations: text(input.accommodations, 2000) || undefined,
    mediaAcknowledgement:
      typeof input.mediaAcknowledgement === "boolean" ? input.mediaAcknowledgement : undefined,
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

  if (data.phone && !PHONE_PATTERN.test(data.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (data.dateOfBirth) {
    const parsed = DATE_PATTERN.test(data.dateOfBirth) ? new Date(`${data.dateOfBirth}T00:00:00Z`) : null;
    if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== data.dateOfBirth || parsed > new Date()) {
      errors.dateOfBirth = "Please enter a valid date of birth.";
    }
  }

  if (data.attendanceMode && !ATTENDANCE_MODES.has(data.attendanceMode)) {
    errors.attendanceMode = "Please select a valid attendance mode.";
  }

  if (data.gender && !GENDER_OPTIONS.has(data.gender)) {
    errors.gender = "Please select a valid gender option.";
  }

  if (data.mediaAcknowledgement !== undefined && typeof input.mediaAcknowledgement !== "boolean") {
    errors.mediaAcknowledgement = "Please provide a valid media acknowledgement.";
  }

  if (options.requireKnowYourRightsFields) {
    if (!data.lastName) errors.lastName = "Please enter your last name.";
    if (!data.dateOfBirth) errors.dateOfBirth = "Date of birth is required.";
    if (!data.gender) errors.gender = "Please select a gender option.";
    if (!data.phone) errors.phone = "Phone number is required.";
    if (!data.city) errors.city = "City is required.";
    if (!data.county) errors.county = "County is required.";
    if (!data.attendanceMode) errors.attendanceMode = "Please select how you will attend.";
    if (data.mediaAcknowledgement !== true) {
      errors.mediaAcknowledgement = "Media acknowledgement is required.";
    }
  }

  return Object.keys(errors).length ? { errors } : { data, errors };
}
