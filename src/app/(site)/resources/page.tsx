import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resources",
  description: "Community resources from Lakay Toussaint Community Alliance.",
};

const resources = [
  ["Legal Advocacy", "Immigration referrals, resource navigation, and culturally grounded support."],
  ["Health Access", "Community connections for screenings, care navigation, and wellness events."],
  ["Housing Support", "Stability resources and partner referrals for families in transition."],
  ["Job Resources", "Workforce readiness, certification support, and employer connections."],
];

export default function ResourcesPage() {
  return (
    <>
      <section className="section primary">
        <div className="sectionInner">
          <span className="label">Resous x Resources</span>
          <h1>Useful support, rooted in trust.</h1>
          <p className="lead">
            A practical hub for Haitian-serving resources across advocacy,
            housing, health, jobs, and community care.
          </p>
        </div>
      </section>
      <section className="section low">
        <div className="sectionInner grid two">
          {resources.map(([title, body]) => (
            <article className="card pad" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <div className="sectionInner" style={{ marginTop: "2rem" }}>
          <Link className="button primaryAction" href="/contact">Ask for help</Link>
        </div>
      </section>
    </>
  );
}
