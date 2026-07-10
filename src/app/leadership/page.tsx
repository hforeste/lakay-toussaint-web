import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { leadership } from "../../../data";

export const metadata: Metadata = {
  title: "Leadership",
  description:
    "Meet Lakay Toussaint Community Alliance leadership and board representatives.",
};

export default function LeadershipPage() {
  return (
    <>
      <PageHeader eyebrow="Leadership" title="Building trust with community leadership">
        Funders, partners, and community members can learn the origin of LTCA,
        the Founding Executive Director story, and board leadership as approved
        details become available.
      </PageHeader>
      <section className="section splitSection">
        <div className="sectionTitle">
          <p className="eyebrow">Origin</p>
          <h2>Leadership credibility starts with a clear story.</h2>
          <p className="lead">
            Funders and partners should quickly understand why LTCA exists, who
            is stewarding it, and how board details will be shared as approved.
          </p>
        </div>
        <article className="card storyCard">
          <h2>Founding Executive Director Story</h2>
          <p>
            LTCA was founded to answer a clear community need: a Haitian-led
            alliance where Seattle&apos;s Haitian diaspora can gather, organize,
            celebrate culture, access resources, and build power from Seattle to
            Haiti.
          </p>
          <p className="sourceNote">
            Placeholder: replace with the approved first-person founder bio and
            origin story before launch.
          </p>
        </article>
      </section>
      <section className="section">
        <div className="sectionTitle">
          <p className="eyebrow">People</p>
          <h2>Board and leadership</h2>
        </div>
        <div className="grid">
          {leadership.map((person) => (
            <article className="card" key={person.id}>
              <div aria-hidden="true" className="placeholderPortrait">
                {person.name.charAt(0)}
              </div>
              <h2>{person.name}</h2>
              <p className="meta">{person.role}</p>
              <p>{person.bio}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
