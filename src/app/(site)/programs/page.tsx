import type { Metadata } from "next";
import Link from "next/link";
import { DesignImage } from "@/components/DesignImage";
import { imagery } from "@/lib/design-content";

export const metadata: Metadata = {
  title: "Programs",
  description: "Programs from Lakay Toussaint Community Alliance.",
};

export default function ProgramsPage() {
  return (
    <>
      <section className="section primary">
        <div className="sectionInner">
          <span className="label">Pwogram nou yo x Our Programs</span>
          <h1>&quot;A lakay takes care of its own...&quot;</h1>
          <p className="lead">
            At Lakay Toussaint Community Alliance, we build bridges of
            opportunity and provide a sanctuary for the Haitian community.
          </p>
        </div>
      </section>

      <section className="section white">
        <div className="sectionInner split">
          <div className="imageFrame">
            <DesignImage src={imagery.programFeature} alt="Haitian mentor and young adult in a community center" />
          </div>
          <div>
            <span className="flagBadge">Priyorite ane sa a x Our focus this year</span>
            <span className="label" style={{ marginTop: "1.5rem" }}>Pwogram Sipo Imigrasyon</span>
            <h2>Immigration Support Program</h2>
            <p className="lead">
              We provide culturally relevant assistance for families navigating
              Temporary Protected Status, humanitarian parole, and direct legal
              referrals.
            </p>
            <p>
              Lakay Toussaint is a community advocacy organization and does not
              provide direct legal representation. We connect families with
              certified immigration attorneys.
            </p>
            <Link className="button primaryAction" href="/contact">Get immigration help x Jwenn ed imigrasyon</Link>
          </div>
        </div>
      </section>

      <section className="section mid">
        <div className="sectionInner grid two">
          <article className="card pad">
            <div className="cardImage square">
              <DesignImage src={imagery.students} alt="Haitian students in a bright classroom" />
            </div>
            <span className="label">Pwogram Jen Lide Demen</span>
            <h3>Youth Academic & Leadership Program</h3>
            <p>
              Equipping students with academic tutoring, college preparation, and
              leadership training that celebrates their Haitian roots.
            </p>
            <Link className="button secondaryAction" href="/join-us">Enroll a student x Enskri yon elev</Link>
          </article>
          <article className="card pad primaryCard">
            <span className="label">Pwogram Endepandans Ekonomik</span>
            <h3>Workforce & Economic Mobility Program</h3>
            <p>
              Breaking barriers to employment through professional certifications,
              trade-focused English practice, and job placement partnerships.
            </p>
            <ul>
              <li>Professional certification support</li>
              <li>Resume and interview workshops</li>
              <li>Employer networking events</li>
            </ul>
            <Link className="button lightAction" href="/contact">Start your path x Komanse chemen ou</Link>
          </article>
        </div>
      </section>

      <section className="section white">
        <div className="sectionInner" style={{ textAlign: "center" }}>
          <span className="label">Fon Ijans Fanmi</span>
          <h2>The Family Emergency Fund</h2>
          <p className="lead" style={{ marginInline: "auto" }}>
            When crises strike, our community provides rapid-response support for
            rent, medical bills, and immediate needs for families in transition.
          </p>
          <div className="actions" style={{ justifyContent: "center" }}>
            <Link className="button donate" href="/donate">Support the fund x Bay nan fon an</Link>
            <Link className="button secondaryAction" href="/contact">Apply for help</Link>
          </div>
        </div>
      </section>

      <section className="section primary">
        <div className="sectionInner grid two">
          <article className="card pad primaryCard">
            <span className="label">The bridge home</span>
            <h3>Rebati Ayiti x Rebuilding Haiti</h3>
            <p>
              Our commitment extends beyond local borders through partnerships
              with grassroots organizations in Haiti for sustainable development
              and disaster relief.
            </p>
          </article>
          <article className="card">
            <div className="cardImage">
              <DesignImage src={imagery.fair} alt="Community resource fair with volunteers and Haitian food" />
            </div>
            <div className="cardBody">
              <span className="label">Jounen Resous Kominote</span>
              <h3>Annual Community Resource Fair</h3>
              <p>Partner organizations, healthcare providers, and local services in one joyful day of empowerment.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="section gold">
        <div className="sectionInner" style={{ textAlign: "center" }}>
          <h2>Need Support or Want to Partner?</h2>
          <p className="lead" style={{ marginInline: "auto", color: "rgba(0,30,55,.86)" }}>
            We are stronger together. Whether you are seeking a program or
            represent an organization looking to collaborate, we want to hear
            from you.
          </p>
          <div className="actions" style={{ justifyContent: "center" }}>
            <Link className="button secondaryAction" href="/events">View All Events</Link>
            <Link className="button secondaryAction" href="/contact">Contact Our Team</Link>
          </div>
        </div>
      </section>
    </>
  );
}
