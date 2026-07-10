import type { Metadata } from "next";
import Link from "next/link";
import { navigation, siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lakay Toussaint Community Alliance",
    template: "%s | Lakay Toussaint",
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="siteHeader">
          <div className="navWrap">
            <Link className="brand" href="/">
              {siteConfig.shortName}
            </Link>
            <nav className="nav" aria-label="Primary navigation">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="siteFooter">
          <div className="footerWrap">
            <div>
              <strong>{siteConfig.name}</strong>
              <p>Building community here. Rebuilding home there.</p>
            </div>
            <p>
              Contact: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
