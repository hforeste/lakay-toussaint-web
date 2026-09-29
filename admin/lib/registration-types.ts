export type AdminRegistrationStatus = "confirmed" | "cancelled";
export type AdminAttendanceMode = "in-person" | "zoom" | null;
export type AdminRegistrationSort = "createdAt" | "name" | "partySize";
export type SortDirection = "asc" | "desc";

export interface RegistrationCapacitySummary {
  registrationCount: number;
  cancelledRegistrationCount: number;
  registeredAttendees: number;
  capacity: number | null;
  remainingSpaces: number | null;
  percentFilled: number | null;
  nearCapacity: boolean;
}

export interface AdminRegistration {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsappPhone: string;
  whatsappOptIn: boolean;
  attendeeCount: number;
  status: AdminRegistrationStatus;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string;
  dateOfBirth: string;
  gender: string;
  city: string;
  county: string;
  attendanceMode: AdminAttendanceMode;
  accommodations: string;
  mediaAcknowledgement: boolean | null;
}

export interface RegistrationListFilters {
  search: string;
  status: "all" | AdminRegistrationStatus;
  attendanceMode: "all" | Exclude<AdminAttendanceMode, null>;
  sort: AdminRegistrationSort;
  direction: SortDirection;
}

export interface RegistrationListResponse {
  registrations: AdminRegistration[];
  summary: RegistrationCapacitySummary;
}

export interface AdminRegistrationInput {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  whatsappPhone?: string;
  whatsappOptIn?: boolean;
  attendeeCount: number;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  county?: string;
  attendanceMode?: Exclude<AdminAttendanceMode, null>;
  accommodations?: string;
  mediaAcknowledgement?: boolean;
}
