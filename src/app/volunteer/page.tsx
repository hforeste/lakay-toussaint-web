import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { VolunteerForm } from "@/components/VolunteerForm";
import { whyNowNeeds } from "../../../data";

export const metadata: Metadata = {
  title: "Volunteer",
  description:
    "Volunteer with Lakay Toussaint Community Alliance for events, outreach, translation, setup, and community support.",
};

export default function VolunteerPage() {
  return (
    <>
      <PageHeader eyebrow="Volunteer" title="Help build Lakay">
        Volunteers help LTCA welcome families, support events, translate,
        outreach, and set up the community infrastructure our people need.
      </PageHeader>
      <section className="section splitSection">
        <div className="sectionTitle">
          <p className="eyebrow">Volunteer engine</p>
          <h2>Small roles make the community feel cared for.</h2>
          <p className="lead">
            Event day help, outreach, translation, and setup are the practical
            work that makes a gathering feel like Lakay.
          </p>
        </div>
        <div className="grid two">
          <article className="card">
            <h2>Why now</h2>
            <ul>
              {whyNowNeeds.map((need) => (
                <li key={need}>{need}</li>
              ))}
            </ul>
          </article>
          <article className="card">
            <h2>Volunteer roles</h2>
            <ul>
              <li>Event day help</li>
              <li>Outreach</li>
              <li>Translation</li>
              <li>Setup and teardown</li>
            </ul>
          </article>
        </div>
      </section>
      <section className="section">
        <div className="sectionTitle">
          <p className="eyebrow">Get involved</p>
          <h2>Sign up to volunteer</h2>
        </div>
        <VolunteerForm />
      </section>
    </>
  );
}
