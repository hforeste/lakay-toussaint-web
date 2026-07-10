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
      <section className="section">
        <div className="grid two">
          <article className="card">
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
          <article className="card">
            <h2>Send a message</h2>
            <ContactForm />
          </article>
        </div>
      </section>
    </>
  );
}
