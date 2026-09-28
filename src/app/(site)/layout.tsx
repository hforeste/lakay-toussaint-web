import Image from "next/image";
import Link from "next/link";

import { MobileMenu } from "@/components/MobileMenu";
import { ScrollReveal } from "@/components/ScrollReveal";
import { navigation, siteConfig } from "@/lib/site";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ScrollReveal />

      <header className="topbar">
        <nav className="navShell" aria-label="Primary navigation">
          <Link
            className="brandMark"
            href="/"
            aria-label="Lakay Toussaint home"
          >
            <Image
              className="brandLogo"
              src={siteConfig.logo}
              alt=""
              width={64}
              height={64}
              priority
            />

            <span>{siteConfig.shortName}</span>
          </Link>

          <div className="desktopNav">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="navActions">
            <Link className="textAction" href="/contact">
              Contact
            </Link>

            <Link className="mobileJoinButton" href="/join-us">
              Join
            </Link>

            <Link className="donateButton" href="/donate">
              Support Us
            </Link>

            <MobileMenu />
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="siteFooter">
        <div className="footerGrid">
          <section>
            <Image
              className="footerLogo"
              src={siteConfig.logo}
              alt={siteConfig.name}
              width={96}
              height={96}
            />

            <h2>{siteConfig.shortName}</h2>

            <p>
              Empowering the Haitian community in Washington State through
              cultural celebration, socioeconomic advocacy, and shared
              resources.
            </p>
          </section>

          <section>
            <h3>Mission &amp; History</h3>
            <Link href="/about">Our Story</Link>
            <Link href="/programs">Programs</Link>
            <Link href="/events">Events</Link>
          </section>

          <section>
            <h3>Partner With Us</h3>
            <Link href="/join-us">Become a Member</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/donate">Support Us</Link>
          </section>

          <section>
            <h3>Newsletter</h3>

            <form className="footerSubscribe">
              <label className="srOnly" htmlFor="footer-email">
                Email address
              </label>

              <input
                id="footer-email"
                type="email"
                placeholder="Your email"
              />

              <button type="submit">Subscribe</button>
            </form>
          </section>
        </div>

        <div className="footerBottom">
          © 2024 {siteConfig.name}. No Haitian Left Behind. Fiscal sponsorship
          by Byrd Barr Place.
        </div>
      </footer>
    </>
  );
}
