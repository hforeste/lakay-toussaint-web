export type EventTopic = {
  icon: string;
  title: string;
  subtitle?: string;
};

export type EventPartner = {
  name: string;
  logo: string;
  website?: string;
};

export type EventItem = {
  slug: string;
  label: string;
  title: string;
  dateLabel: string;
  date?: string;
  time?: string;
  location?: string;
  locationDetail?: string;
  online?: boolean;
  interpreterNote?: string;
  interpreterSubtext?: string;
  summary: string;
  image?: string;
  primary?: boolean;
  featured?: boolean;
  registerHref?: string;
  topics?: EventTopic[];
  partners?: EventPartner[];
};

export const events: EventItem[] = [
  {
    slug: "know-your-rights",
    label: "Konnen dwa ou x Know Your Rights",
    title: "Know Your Rights",

    dateLabel: "Saturday, October 17, 2026",
    date: "2026-10-17",
    time: "11 AM to 2 PM PT",

    location: "Walk Your Plans",
    locationDetail: "3300 1st Ave S, Seattle, WA",

    online: true,

    interpreterNote: "Haitian Creole interpreters on site",
    interpreterSubtext:
      "Entèprèt kreyòl sou plas · Slides in English and Kreyòl",

    summary:
      "A community presentation on detention, TPS updates, and how to get legal help from the Northwest Immigrant Rights Project. Join us in person or on Zoom.",

    featured: true,

    registerHref: "/events/know-your-rights#register",

    topics: [
      {
        icon: "gavel",
        title: "Know Your Rights",
        subtitle: "Konnen dwa ou",
      },
      {
        icon: "info",
        title: "Information on detention",
        subtitle: "Enfòmasyon sou detansyon",
      },
      {
        icon: "shield",
        title: "How to access NWIRP representation",
        subtitle: "Kijan pou jwenn reprezantasyon NWIRP",
      },
      {
        icon: "update",
        title: "Updates on TPS",
        subtitle: "Dènye nouvèl sou TPS",
      },
      {
        icon: "groups",
        title: "Resources",
        subtitle: "Resous",
      },
    ],

    partners: [
      {
        name: "Northwest Immigrant Rights Project",
        logo: "/images/partners/nwirp-logo.png",
      },
    ],
  },

  {
    slug: "haitian-independence",
    label: "1804 x Haitian Independence",
    title: "1804: A Haitian Independence Day Celebration",
    dateLabel: "Every New Year",
    image: "/images/events/independence.jpg",
    summary:
      "On January 1, 1804, Haiti declared itself the first free Black republic in the world. Every New Year, we gather to honor that legacy the Haitian way, with soup joumou, music, history, and celebration.",
  },

  {
    slug: "haitian-flag-day",
    label: "Jou Drapo Ayisyen x Haitian Flag Day",
    title: "Jou Drapo Ayisyen x Haitian Flag Day",
    dateLabel: "Every May 18",
    summary:
      "In 1803 at Arcahaie, Catherine Flon sewed the blue and red together and the Haitian flag was born. Every May 18, we celebrate the flag and the story behind it, with our young people leading the way.",
  },

  {
    slug: "taste-of-haiti",
    label: "Goute Ayiti x Taste of Haiti",
    title: "A Taste of Haiti",
    dateLabel: "Every Labor Day",
    image: "/images/events/taste.jpg",
    summary:
      "The picnic that started it all. Every Labor Day, the community gathers for Haitian food, live music, family activities, and joy, free and open to everyone.",
  },

  {
    slug: "community-resource-fair",
    label: "Jounen Resous Kominote x Community Resource Fair",
    title: "Jounen Resous Kominote x Community Resource Fair",
    dateLabel: "Every November",
    summary:
      "One afternoon, every resource, all in Kreyol. Partner organizations gather under one roof for immigration legal help, healthcare enrollment, housing, schools, and job training.",
    primary: true,
  },
];

export const featuredEvent = events.find((event) => event.featured) ?? null;

export const recurringEvents = events.filter((event) => !event.featured);

export function getEventBySlug(slug: string) {
  return events.find((event) => event.slug === slug);
}
