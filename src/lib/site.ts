export const siteConfig = {
  name: "Lakay Toussaint Community Alliance",
  shortName: "Lakay Toussaint",
  url: "https://lakaytoussaint.org",
  description:
    "A Haitian-led community alliance building community in Seattle and rebuilding home in Haiti.",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@example.org",
  donationUrl: process.env.NEXT_PUBLIC_DONATION_URL || "",
  social: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
  },
};

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/leadership", label: "Leadership" },
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/directory", label: "Directory" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/donate", label: "Donate" },
  { href: "/contact", label: "Contact" },
];
