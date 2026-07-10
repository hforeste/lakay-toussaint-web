import type { Pillar } from "./types";

export const organizationCopy = {
  name: "Lakay Toussaint Community Alliance",
  shortName: "Lakay Toussaint",
  tagline: "Building community here. Rebuilding home there.",
  missionStatement: "No Haitian Left Behind.",
  mission:
    "Lakay Toussaint Community Alliance builds collective power through education, economic empowerment, direct service, justice, and Haiti rebuilding.",
  vision:
    "A thriving Haitian community where no one is left behind, empowered with knowledge, economic opportunity, and justice here in Seattle, while actively rebuilding and strengthening Haiti for generations to come.",
  nameHeritage: {
    lakay:
      "In Kreyol, Lakay means home. It represents creating community and home here in Seattle while actively rebuilding home in Haiti.",
    toussaint:
      "Toussaint honors Toussaint Louverture, Haiti's founding father and liberator, whose legacy reflects vision, education, freedom, and service to the people.",
    combined:
      "Community Alliance means building collective power through partnership. Together, Lakay Toussaint is home, heritage, and a call to serve.",
  },
  sourceStatus: "source-backed",
} as const;

export const values = [
  {
    id: "heritage",
    title: "Service over self",
    summary:
      "We put community needs ahead of individual gain and build programs that meet people where they are.",
    sourceStatus: "source-backed",
  },
  {
    id: "belonging",
    title: "Community over gain",
    summary:
      "We believe Haitian families rise together through trust, partnership, and shared responsibility.",
    sourceStatus: "source-backed",
  },
  {
    id: "heritage-dignity",
    title: "Heritage and dignity",
    summary:
      "We preserve Haitian history, culture, language, and traditions with pride and care.",
    sourceStatus: "source-backed",
  },
  {
    id: "justice",
    title: "Justice",
    summary:
      "We advocate for equity, civil rights, and systemic change that affects Haitian families.",
    sourceStatus: "source-backed",
  },
  {
    id: "opportunity",
    title: "Economic opportunity",
    summary:
      "We support entrepreneurship, financial literacy, professional growth, and wealth-building.",
    sourceStatus: "source-backed",
  },
  {
    id: "home",
    title: "Home here and there",
    summary:
      "We build belonging in Seattle while supporting development and resilience in Haiti.",
    sourceStatus: "source-backed",
  },
] as const;

export const pillars: Pillar[] = [
  {
    id: "education",
    title: "Education",
    summary:
      "Empowering the community with knowledge, skills, college pathways, professional development, and scholarship access.",
    sourceStatus: "source-backed",
  },
  {
    id: "economic-empowerment",
    title: "Economic Empowerment",
    summary:
      "Advancing financial literacy, entrepreneurship, job placement, and wealth-building.",
    sourceStatus: "source-backed",
  },
  {
    id: "service",
    title: "Service",
    summary:
      "Meeting needs through food assistance, housing support, emergency relief, and community resources.",
    sourceStatus: "source-backed",
  },
  {
    id: "justice",
    title: "Justice",
    summary:
      "Advocating for civil rights, policy change, community organizing, and systemic equity.",
    sourceStatus: "source-backed",
  },
  {
    id: "haiti-rebuilding",
    title: "Haiti Rebuilding",
    summary:
      "Supporting infrastructure, development projects, strategic partnerships, and direct investment in Haiti.",
    sourceStatus: "source-backed",
  },
];

export const whyNowNeeds = [
  "Economic challenges",
  "Educational barriers",
  "Limited cultural support",
  "Need for advocacy",
  "Haiti rebuilding needs",
  "Fragmented resources",
] as const;

export const donationCopy = {
  headline: "Support Haitian community strength",
  body:
    "Your donation helps LTCA create welcoming programs, connect families to practical resources, support youth leadership, celebrate Haitian culture, advocate for justice, and support Haiti rebuilding partnerships.",
  fiscalSponsorDisclosure:
    "Lakay Toussaint Community Alliance is fiscally sponsored by Byrd Barr Place, a 501(c)(3) organization. Donations are tax-deductible.",
  useCases: [
    "Education and youth leadership",
    "Economic empowerment and entrepreneurship",
    "Food, housing, emergency relief, and community resources",
    "Civil rights advocacy and policy work",
    "Haiti rebuilding partnerships and direct investment",
  ],
  sourceStatus: "source-backed",
} as const;

export const sponsorshipCopy = {
  headline: "Partner with Lakay Toussaint",
  body:
    "Sponsors help Lakay Toussaint expand access to cultural events, youth programming, family resources, and small-business visibility. Sponsorship is a partnership in Haitian community strength.",
  opportunities: [
    "Sponsor a cultural event or community gathering.",
    "Fund a youth workshop or leadership cohort.",
    "Support family resource navigation and outreach.",
    "Become a directory partner for Haitian-owned businesses and community services.",
    "Contribute in-kind goods, venues, professional services, food, printing, or media support.",
  ],
  sourceStatus: "placeholder",
} as const;
