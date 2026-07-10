import type { EventSeedRecord } from "./types";

// Seed-only records for Firebase emulator or local data import examples.
// Page components should read events from Firebase-owned data per issue #11.
export const eventSeedRecords: EventSeedRecord[] = [
  {
    id: "a-taste-of-haiti-2026",
    slug: "a-taste-of-haiti-2026",
    title: "A Taste of Haiti",
    startsAt: "2026-09-07T18:00:00-07:00",
    locationName: "Location to be confirmed",
    locationAddress: "Seattle, WA",
    summary:
      "A community celebration of Haitian food, culture, and connection.",
    description:
      "Join Lakay Toussaint Community Alliance for a celebration that brings Seattle's Haitian diaspora together through food, culture, music, and community connection.",
    rsvpUrl: "https://example.com/a-taste-of-haiti",
    status: "published",
    order: 1,
    pillarIds: ["education", "economic-empowerment", "service"],
    sourceStatus: "sample",
  },
  {
    id: "1804-celebration-2027",
    slug: "1804-celebration-2027",
    title: "1804 Celebration",
    startsAt: "2027-01-01T18:00:00-08:00",
    locationName: "Location to be confirmed",
    locationAddress: "Seattle, WA",
    summary:
      "A Haitian Independence Day celebration honoring history, culture, and community.",
    description:
      "Celebrate Haitian independence and the legacy of 1804 with community, culture, and shared purpose.",
    rsvpUrl: "https://example.com/1804-celebration",
    status: "published",
    order: 2,
    pillarIds: ["education", "justice", "haiti-rebuilding"],
    sourceStatus: "sample",
  },
];
