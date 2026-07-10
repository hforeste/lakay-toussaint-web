import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { organizationCopy, values } from "../../../data";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Lakay Toussaint Community Alliance, its Haitian heritage, mission, vision, and Pacific Northwest focus.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About LTCA" title="A home for Haitian community power">
        {organizationCopy.nameHeritage.combined}
      </PageHeader>
      <section className="section">
        <div className="grid two">
          <article className="card storyCard">
            <h2>Mission</h2>
            <p>{organizationCopy.mission}</p>
          </article>
          <article className="card storyCard">
            <h2>Vision</h2>
            <p>{organizationCopy.vision}</p>
          </article>
        </div>
      </section>
      <section className="section splitSection">
        <div className="sectionTitle">
          <p className="eyebrow">Name & Heritage</p>
          <h2>Why Lakay Toussaint</h2>
          <p className="lead">
            The name holds the promise of home, the legacy of liberation, and
            the discipline of building together.
          </p>
        </div>
        <div className="grid">
          <article className="card">
            <h3>Lakay</h3>
            <p>{organizationCopy.nameHeritage.lakay}</p>
          </article>
          <article className="card">
            <h3>Toussaint</h3>
            <p>{organizationCopy.nameHeritage.toussaint}</p>
          </article>
          <article className="card">
            <h3>Community Alliance</h3>
            <p>{organizationCopy.nameHeritage.combined}</p>
          </article>
        </div>
      </section>
      <section className="section featureSection">
        <div className="sectionTitle">
          <p className="eyebrow">Values</p>
          <h2>Rooted in service and belonging</h2>
        </div>
        <div className="grid">
          {values.map((value) => (
            <article className="card" key={value.id}>
              <h3>{value.title}</h3>
              <p>{value.summary}</p>
            </article>
          ))}
        </div>
        <div className="actions">
          <Link className="button primary" href="/volunteer">
            Volunteer
          </Link>
          <Link className="button secondary" href="/contact">
            Contact LTCA
          </Link>
        </div>
      </section>
    </>
  );
}
