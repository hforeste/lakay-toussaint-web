import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Support Us",
  description: "Support Lakay Toussaint Community Alliance.",
};

export default function DonatePage() {
  const donationHref = siteConfig.donationUrl || "/contact";

  return (
    <>
      <section className="section primary">
        <div className="sectionInner" style={{ textAlign: "center" }}>
          <span className="label">Fe yon don x Support Us</span>
          <h1>Support a community worth building.</h1>
          <p className="lead" style={{ marginInline: "auto" }}>
            Your contribution supports immigration advocacy, youth mentorship,
            cultural events, and rapid-response community care.
          </p>
        </div>
      </section>
      <section className="section white">
        <div className="sectionInner grid two">
          <article className="card pad goldBorder">
            <h2>Give through our fiscal sponsor</h2>
            <p>
              Lakay Toussaint Community Alliance is fiscally sponsored by Byrd
              Barr Place. Contributions are tax-deductible to the extent allowed by
              law.
            </p>
            <Link className="button donate" href={donationHref}>Support Us</Link>
          </article>
          <article className="card pad">
            <h2>Your gift supports</h2>
            <ul>
              <li>Immigration resource navigation and referrals</li>
              <li>Youth academic and leadership programming</li>
              <li>Workforce and economic mobility support</li>
              <li>Community events that preserve Haitian culture</li>
            </ul>
          </article>
        </div>
      </section>
    </>
  );
}
