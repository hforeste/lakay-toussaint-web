export type EventStatus = "draft" | "published" | "cancelled" | "completed";

export interface PublicEvent {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  startsAt: Date;
  endsAt: Date | null;
  timeZone: string;
  locationName: string;
  locationAddress: string | null;
  summary: string;
  description: string;
  heroImageUrl: string | null;
  capacity: number | null;
  registeredAttendees: number;
  registrationOpensAt: Date | null;
  registrationClosesAt: Date | null;
  maxPartySize: number;
  registrationAvailable: boolean;
}

export interface RegistrationInput {
  firstName: string;
  lastName: string;
  email: string;
  attendeeCount: number;
  whatsappPhone: string;
  whatsappOptIn: boolean;
}

export interface RegistrationValidationResult {
  data?: RegistrationInput;
  errors: Partial<Record<keyof RegistrationInput, string>>;
}
