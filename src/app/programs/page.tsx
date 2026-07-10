import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { pillars, programs } from "../../../data";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Explore LTCA programs across education, economic empowerment, service, justice, and Haiti rebuilding.",
};

export default function ProgramsPage() {
  return (
    <>
      <PageHeader eyebrow="Programs" title="Five pillars, one community mission">
        LTCA&apos;s program model brings together empowerment, direct service,
        advocacy, and Haiti rebuilding.
      </PageHeader>
      <section className="section featureSection">
        <div className="sectionTitle">
          <p className="eyebrow">Model</p>
          <h2>Programs that connect immediate needs to long-term power</h2>
          <p className="lead">
            Each pillar answers a real pressure point while reinforcing the
            bigger mission: no Haitian left behind.
          </p>
        </div>
        <div className="grid">
          {pillars.map((pillar) => (
            <article className="card" key={pillar.id}>
              <h2>{pillar.title}</h2>
              <p>{pillar.summary}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section splitSection">
        <div className="sectionTitle">
          <p className="eyebrow">Program areas</p>
          <h2>Program areas</h2>
          <p className="lead">
            Phase 1 can start lean, then grow as partners, volunteers, and
            funding come online.
          </p>
        </div>
        <div className="grid two">
          {programs.map((program) => (
            <article className="card" key={program.id}>
              <h3>{program.title}</h3>
              <p>{program.summary}</p>
              <p className="meta">Audience: {program.audience.join(", ")}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
