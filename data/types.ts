export type SourceStatus = "source-backed" | "placeholder" | "sample";

export type PillarId =
  | "education"
  | "economic-empowerment"
  | "service"
  | "justice"
  | "haiti-rebuilding";

export interface Pillar {
  id: PillarId;
  title: string;
  summary: string;
  sourceStatus: SourceStatus;
}

export interface Program {
  id: string;
  title: string;
  pillarIds: PillarId[];
  summary: string;
  audience: string[];
  status: "active" | "planned" | "seasonal" | "archived";
  sourceStatus: SourceStatus;
}

export interface DirectoryResource {
  id: string;
  name: string;
  category:
    | "business"
    | "community-service"
    | "education"
    | "health"
    | "legal"
    | "food"
    | "arts-culture";
  summary: string;
  pillarIds: PillarId[];
  location?: string;
  websiteUrl?: string;
  contactEmail?: string;
  tags: string[];
  sourceStatus: SourceStatus;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: "founding" | "community" | "program" | "in-kind";
  summary: string;
  websiteUrl?: string;
  sourceStatus: SourceStatus;
}

export interface Leader {
  id: string;
  name: string;
  role: string;
  bio: string;
  pillarIds: PillarId[];
  sourceStatus: SourceStatus;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  category: "announcement" | "program" | "community" | "sponsor" | "press";
  sourceStatus: SourceStatus;
}

export interface EventSeedRecord {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  startsAt: string;
  endsAt?: string;
  locationName: string;
  locationAddress: string;
  neighborhood?: string;
  googleMapsUrl?: string;
  googleMapsEmbedUrl?: string;
  summary: string;
  description: string;
  heroImageUrl?: string;
  ticketUrl?: string;
  rsvpUrl: string;
  ticketCtaLabel?: string;
  isFree?: boolean;
  expectedAttendeeCount?: number;
  attendeeCountLabel?: string;
  whatsappShareText?: string;
  instagramCaption?: string;
  tiktokCaption?: string;
  highlights?: EventHighlight[];
  scheduleItems?: EventScheduleItem[];
  faqItems?: EventFaqItem[];
  status: "draft" | "published" | "archived";
  isFeatured?: boolean;
  order: number;
  pillarIds: PillarId[];
  sourceStatus: "sample";
}

export interface EventHighlight {
  title: string;
  description: string;
}

export interface EventScheduleItem {
  time: string;
  title: string;
  description?: string;
}

export interface EventFaqItem {
  question: string;
  answer: string;
}
