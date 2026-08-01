export const siteConfig = {
  name: "Lakay Toussaint Community Alliance",
  shortName: "Lakay Toussaint",
  logo: "/images/brand/ltca-logo-512.webp",
  url: "https://lakaytoussaint.org",
  description:
    "Seattle's home for Haitian culture, community, advocacy, and connection.",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@lakaytoussaint.org",
  donationUrl: process.env.NEXT_PUBLIC_DONATION_URL || "",
  social: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
  },
};

export const navigation = [
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/join-us", label: "Join Us" },
  { href: "/resources", label: "Resources" },
  { href: "/news", label: "News" },
];
