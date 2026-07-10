import type { DirectoryResource } from "./types";

export const directoryResources: DirectoryResource[] = [
  {
    id: "haitian-owned-business-directory",
    name: "Haitian-Owned Business Directory",
    category: "business",
    summary:
      "A curated directory entry category for Haitian-owned businesses, entrepreneurs, vendors, and professional services.",
    pillarIds: ["economic-empowerment"],
    tags: ["placeholder", "business", "entrepreneurship"],
    sourceStatus: "placeholder",
  },
  {
    id: "family-support-referrals",
    name: "Family Support Referrals",
    category: "community-service",
    summary:
      "A resource category for trusted food, housing, health, legal, education, immigration, and public-service referrals.",
    pillarIds: ["service", "justice"],
    tags: ["placeholder", "referrals", "family-support"],
    sourceStatus: "placeholder",
  },
  {
    id: "haitian-arts-culture-network",
    name: "Haitian Arts and Culture Network",
    category: "arts-culture",
    summary:
      "A resource category for artists, performers, educators, chefs, historians, and culture bearers.",
    pillarIds: ["education"],
    tags: ["placeholder", "arts", "culture"],
    sourceStatus: "placeholder",
  },
];
