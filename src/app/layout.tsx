import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: "Lakay Toussaint Community Alliance",
    template: "%s | Lakay Toussaint",
  },

  description: siteConfig.description,

  icons: {
    apple: "/images/brand/ltca-logo-256.png",

    icon: [
      {
        url: "/images/brand/ltca-logo-256.png",
        type: "image/png",
        sizes: "256x256",
      },
      {
        url: "/images/brand/ltca-logo-512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
  },

  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,

    images: [
      {
        url: "/images/brand/ltca-logo-1024.png",
        width: 894,
        height: 890,
        alt: siteConfig.name,
      },
    ],

    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>

      <body>{children}</body>
    </html>
  );
}