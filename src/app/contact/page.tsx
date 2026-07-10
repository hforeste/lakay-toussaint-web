import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { PageHeader } from "@/components/PageHeader";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Lakay Toussaint Community Alliance for community questions, volunteering, partnerships, and media inquiries.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Contact" title="Reach Lakay Toussaint">
        Community members, volunteers, partners, funders, and media can contact
        LTCA here.
      </PageHeader>
      <section className="section splitSection contactSection">
        <div className="sectionTitle">
          <p className="eyebrow">Start here</p>
          <h2>One clear path for community, partners, funders, and media.</h2>
          <p className="lead">
            The contact page should make LTCA feel reachable and organized, not
            like a form floating on an empty page.
          </p>
        </div>
        <div className="contactGrid">
          <article className="card contactInfoCard">
            <h2>Contact information</h2>
            <p>
              Email: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
            </p>
            <p>
              Instagram:{" "}
              <a href={siteConfig.social.instagram} rel="noreferrer" target="_blank">
                Follow LTCA
              </a>
            </p>
          </article>
          <article className="card contactFormCard">
            <h2>Send a message</h2>
            <ContactForm />
          </article>
        </div>
      </section>
    </>
  );
}
