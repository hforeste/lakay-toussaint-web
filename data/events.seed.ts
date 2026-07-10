import type { EventSeedRecord } from "./types";

// Seed-only records for Firebase emulator or local data import examples.
// Page components should read events from Firebase-owned data per issue #11.
export const eventSeedRecords: EventSeedRecord[] = [
  {
    id: "a-taste-of-haiti-2026",
    slug: "a-taste-of-haiti-2026",
    title: "A Taste of Haiti",
    subtitle: "Food, music, vendors, and community connection in the park.",
    startsAt: "2026-09-07T13:00:00-07:00",
    endsAt: "2026-09-07T18:00:00-07:00",
    locationName: "Jefferson Park Picnic Shelter 3",
    locationAddress: "3801 Beacon Ave S, Seattle, WA 98108",
    neighborhood: "Beacon Hill, Seattle",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Jefferson+Park+Seattle",
    googleMapsEmbedUrl:
      "https://www.google.com/maps?q=Jefferson%20Park%20Seattle&output=embed",
    summary:
      "A family-friendly outdoor celebration of Haitian food, culture, music, vendors, and community connection.",
    description:
      "A Taste of Haiti brings Seattle's Haitian diaspora and neighbors together for an afternoon of food, music, culture, small-business visibility, and community care. Come ready to eat, dance, meet local Haitian-owned vendors, connect with LTCA volunteers, and invite someone who needs to know this community exists.",
    heroImageUrl: "/images/events/taste-of-haiti-hero.png",
    ticketUrl: "https://tickets.example.com/a-taste-of-haiti-2026",
    rsvpUrl: "https://tickets.example.com/a-taste-of-haiti-2026",
    ticketCtaLabel: "Get picnic tickets",
    isFree: false,
    expectedAttendeeCount: 240,
    attendeeCountLabel: "neighbors planning to attend",
    whatsappShareText:
      "M ap ale! Join me at A Taste of Haiti with Lakay Toussaint on September 7 at Jefferson Park. Food, music, vendors, and community. RSVP here:",
    instagramCaption:
      "Seattle Haitian community, this one is for us. Food, music, vendors, family, and connection at A Taste of Haiti. #LakayToussaint #SeattleHaitianCommunity",
    tiktokCaption:
      "POV: Seattle's Haitian community takes over the park for food, music, vendors, and family vibes. A Taste of Haiti 2026.",
    highlights: [
      {
        title: "Haitian food vendors",
        description:
          "Taste griot, diri kole, patties, sweets, and drinks from local cooks and vendors.",
      },
      {
        title: "Music and dancing",
        description:
          "A playlist and live moments built for konpa, throwbacks, and family-friendly celebration.",
      },
      {
        title: "Community resource tables",
        description:
          "Meet LTCA volunteers, local partners, and Haitian-serving resources in one place.",
      },
      {
        title: "Bring the whole family",
        description:
          "A welcoming picnic atmosphere for elders, young adults, parents, and children.",
      },
    ],
    scheduleItems: [
      {
        time: "1:00 PM",
        title: "Welcome and picnic opens",
        description: "Check in, find your people, and visit food and vendor tables.",
      },
      {
        time: "2:15 PM",
        title: "Community spotlight",
        description: "Short remarks from LTCA and local Haitian community leaders.",
      },
      {
        time: "3:00 PM",
        title: "Music, food, and vendor hour",
        description: "Eat, dance, shop, and connect with community resources.",
      },
      {
        time: "5:15 PM",
        title: "Group photo and closing circle",
        description: "A shared moment to celebrate the community we are building.",
      },
    ],
    faqItems: [
      {
        question: "Is this event family-friendly?",
        answer:
          "Yes. Families, elders, young adults, and children are welcome. The event is designed as a community picnic.",
      },
      {
        question: "Will food be included with my ticket?",
        answer:
          "Tickets help cover the event and may include select tasting items. Additional food and vendor purchases may be available on site.",
      },
      {
        question: "Can I share this event in WhatsApp groups?",
        answer:
          "Yes. Please share the RSVP link with family, friends, church groups, student groups, and community chats.",
      },
    ],
    status: "published",
    isFeatured: true,
    order: 1,
    pillarIds: ["education", "economic-empowerment", "service"],
    sourceStatus: "sample",
  },
  {
    id: "1804-celebration-2027",
    slug: "1804-celebration-2027",
    title: "1804 Celebration",
    subtitle: "Haitian Independence Day with culture, history, and community pride.",
    startsAt: "2027-01-01T17:30:00-08:00",
    endsAt: "2027-01-01T21:30:00-08:00",
    locationName: "Langston Hughes Performing Arts Institute",
    locationAddress: "104 17th Ave S, Seattle, WA 98144",
    neighborhood: "Central District, Seattle",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Langston+Hughes+Performing+Arts+Institute+Seattle",
    googleMapsEmbedUrl:
      "https://www.google.com/maps?q=Langston%20Hughes%20Performing%20Arts%20Institute%20Seattle&output=embed",
    summary:
      "A Haitian Independence Day celebration honoring history, culture, and community.",
    description:
      "The 1804 Celebration honors Haitian Independence Day with an evening of history, culture, intergenerational pride, food, music, and a renewed commitment to building community here while staying connected to Haiti. This gathering is designed for families, elders, students, artists, partners, and anyone who wants to understand why 1804 still matters.",
    heroImageUrl: "/images/events/1804-celebration-hero.png",
    ticketUrl: "https://tickets.example.com/1804-celebration-2027",
    rsvpUrl: "https://tickets.example.com/1804-celebration-2027",
    ticketCtaLabel: "Reserve your seat",
    isFree: false,
    expectedAttendeeCount: 180,
    attendeeCountLabel: "community members expected",
    whatsappShareText:
      "Ann selebre 1804 ansanm! Join Lakay Toussaint for Haitian Independence Day on January 1 in Seattle. Reserve your seat here:",
    instagramCaption:
      "1804 is history, pride, and responsibility. Join Lakay Toussaint in Seattle for Haitian Independence Day. #1804 #HaitianIndependenceDay #LakayToussaint",
    tiktokCaption:
      "Haitian Independence Day in Seattle. Culture, history, food, music, and community pride. 1804 Celebration by Lakay Toussaint.",
    highlights: [
      {
        title: "Independence Day program",
        description:
          "A cultural program honoring the Haitian Revolution, freedom, and the legacy of 1804.",
      },
      {
        title: "Intergenerational gathering",
        description:
          "A space for elders, families, young adults, students, and partners to gather with pride.",
      },
      {
        title: "Food and music",
        description:
          "Celebrate with Haitian flavors, curated music, and moments that feel ceremonial and joyful.",
      },
      {
        title: "Community commitment",
        description:
          "Learn how LTCA is building power in Seattle while supporting Haiti rebuilding work.",
      },
    ],
    scheduleItems: [
      {
        time: "5:30 PM",
        title: "Doors open",
        description: "Check in, greet community, and find your seat.",
      },
      {
        time: "6:15 PM",
        title: "Opening ceremony",
        description: "Welcome, reflection, and recognition of Haitian Independence Day.",
      },
      {
        time: "7:00 PM",
        title: "Culture, history, and performance",
        description: "Music, spoken reflections, and community storytelling.",
      },
      {
        time: "8:30 PM",
        title: "Reception and connection",
        description: "Food, photos, conversation, and partner/resource tables.",
      },
    ],
    faqItems: [
      {
        question: "Should I dress up?",
        answer:
          "Festive or semi-formal attire is welcome. Haitian flag colors and cultural dress are encouraged but not required.",
      },
      {
        question: "Can non-Haitian friends attend?",
        answer:
          "Yes. Allies, neighbors, partners, and friends are welcome to attend respectfully and learn with the community.",
      },
      {
        question: "Will there be seating?",
        answer:
          "Yes. This is planned as an indoor seated celebration with reception time before and after the program.",
      },
    ],
    status: "published",
    isFeatured: true,
    order: 2,
    pillarIds: ["education", "justice", "haiti-rebuilding"],
    sourceStatus: "sample",
  },
];
