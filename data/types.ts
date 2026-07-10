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
  startsAt: string;
  endsAt?: string;
  locationName: string;
  locationAddress: string;
  summary: string;
  description: string;
  rsvpUrl: string;
  status: "draft" | "published" | "archived";
  order: number;
  pillarIds: PillarId[];
  sourceStatus: "sample";
}
