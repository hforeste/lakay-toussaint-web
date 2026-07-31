import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "News",
  description: "News and updates from Lakay Toussaint Community Alliance.",
};

export default function NewsPage() {
  return (
    <>
      <section className="section primary">
        <div className="sectionInner">
          <span className="label">Nouvelles x News</span>
          <h1>Community updates with purpose.</h1>
          <p className="lead">
            Stories, announcements, and advocacy updates from Lakay Toussaint
            will live here as the alliance grows.
          </p>
        </div>
      </section>
      <section className="section white">
        <div className="sectionInner grid three">
          {["Launch updates", "Program notes", "Partner spotlights"].map((title) => (
            <article className="card pad" key={title}>
              <span className="label">Coming Soon</span>
              <h3>{title}</h3>
              <p>Check back for official updates from the Lakay Toussaint team.</p>
            </article>
          ))}
        </div>
        <div className="sectionInner" style={{ marginTop: "2rem" }}>
          <Link className="button primaryAction" href="/join-us">Join for updates</Link>
        </div>
      </section>
    </>
  );
}
