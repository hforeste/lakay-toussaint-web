export type EventStatus = "draft" | "published" | "cancelled" | "completed";
export type EventScheduleStatus = "scheduled" | "date_only" | "tbd";

export interface PublicEvent {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  scheduleStatus: EventScheduleStatus;
  eventDate: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  timeZone: string;
  locationName: string | null;
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
  hasEnded: boolean;
}

export interface RegistrationInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  attendeeCount: number;
  whatsappPhone: string;
  whatsappOptIn: boolean;
  /** Optional campaign-specific fields. Standard event registration does not require these. */
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  county?: string;
  attendanceMode?: "in-person" | "zoom";
  accommodations?: string;
  mediaAcknowledgement?: boolean;
}

export interface RegistrationValidationResult {
  data?: RegistrationInput;
  errors: Partial<Record<keyof RegistrationInput, string>>;
}
