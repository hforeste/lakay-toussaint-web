import type { Program } from "./types";

export const programs: Program[] = [
  {
    id: "education-pathways",
    title: "Education Pathways",
    pillarIds: ["education"],
    summary:
      "Academic support, professional development, college prep, and scholarship access for Haitian youth and families.",
    audience: ["Youth", "Students", "Families"],
    status: "planned",
    sourceStatus: "source-backed",
  },
  {
    id: "economic-empowerment",
    title: "Economic Empowerment",
    pillarIds: ["economic-empowerment"],
    summary:
      "Financial literacy, entrepreneurship support, job placement pathways, and wealth-building resources.",
    audience: ["Professionals", "Business owners", "Families"],
    status: "planned",
    sourceStatus: "source-backed",
  },
  {
    id: "community-service",
    title: "Community Service",
    pillarIds: ["service"],
    summary:
      "Food assistance, housing support, emergency relief, and trusted community resource navigation.",
    audience: ["Families", "Elders", "New arrivals"],
    status: "planned",
    sourceStatus: "source-backed",
  },
  {
    id: "justice-advocacy",
    title: "Justice and Advocacy",
    pillarIds: ["justice"],
    summary:
      "Civil rights advocacy, policy work, community organizing, and systemic-change efforts.",
    audience: ["Community members", "Partners", "Advocates"],
    status: "planned",
    sourceStatus: "source-backed",
  },
  {
    id: "haiti-rebuilding-partnerships",
    title: "Haiti Rebuilding Partnerships",
    pillarIds: ["haiti-rebuilding"],
    summary:
      "Infrastructure, development projects, strategic partnerships, and direct investment that strengthen Haiti for future generations.",
    audience: ["Donors", "Sponsors", "Partners"],
    status: "planned",
    sourceStatus: "source-backed",
  },
];
