import type { Metadata } from "next";
import Link from "next/link";
import { DesignImage } from "@/components/DesignImage";
import { imagery } from "@/lib/design-content";

export const metadata: Metadata = {
  title: "About",
  description: "The founding story, mission, and supporters of Lakay Toussaint Community Alliance.",
};

export default function AboutPage() {
  return (
    <>
      <section className="section primary">
        <div className="sectionInner" style={{ textAlign: "center" }}>
          <span className="label">Misyon Nou x Our Mission</span>
          <h1>Empowering the Haitian community through cultural preservation, economic stability, and civic engagement.</h1>
          <p className="lead" style={{ marginInline: "auto" }}>&quot;No Haitian Left Behind.&quot;</p>
        </div>
      </section>

      <section className="section white">
        <div className="sectionInner split">
          <div>
            <span className="label">Istwa Fondasyon Nou</span>
            <h2>Founding Story</h2>
            <p className="lead">
              Lakay Toussaint began with a simple gathering of food and music in
              2025. What started as a local celebration of heritage quickly
              evolved into a vital community alliance.
            </p>
            <p>
              Our roots are in the kitchen and on the dance floor, but our
              branches reach into policy, education, and economic development.
              By honoring where we come from, we strengthen where we are going.
            </p>
          </div>
          <div className="imageFrame offset">
            <DesignImage src={imagery.founding} alt="Haitian community picnic with food, music, and families" />
          </div>
        </div>
      </section>

      <section className="section low">
        <div className="sectionInner">
          <div className="sectionHeader">
            <h2>Kiyes Nou Ye x Who We Are</h2>
          </div>
          <div className="grid three">
            <article className="card pad">
              <span className="material-symbols-outlined icon" aria-hidden="true">diversity_3</span>
              <h3>Roots in Community</h3>
              <p>We are a grassroots organization born from the lived experiences of the Haitian diaspora.</p>
            </article>
            <article className="card pad primaryCard">
              <span className="material-symbols-outlined icon" aria-hidden="true">shield_with_heart</span>
              <h3>Advocates for Dignity</h3>
              <p>We bridge the gap between resources and families so our community members can thrive, not just survive.</p>
            </article>
            <article className="card pad">
              <span className="material-symbols-outlined icon" aria-hidden="true">handshake</span>
              <h3>Cultural Stewards</h3>
              <p>We preserve and celebrate Haitian culture through events, language education, and mentorship.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section white">
        <div className="sectionInner split">
          <div className="imageFrame">
            <DesignImage src={imagery.supporters} alt="Community supporters gathered together" />
          </div>
          <div>
            <span className="label">Patne Nou</span>
            <h2>Our Supporters</h2>
            <p className="lead">
              Our impact is amplified by partnerships, volunteers, local
              businesses, and individual donors who believe in No Haitian Left
              Behind.
            </p>
            <p>
              We are proudly fiscally sponsored by Byrd Barr Place, an
              organization with deep roots in social justice and community
              empowerment.
            </p>
            <Link className="button primaryAction" href="/contact">Partner With Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
