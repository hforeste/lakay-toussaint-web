import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Lakay Toussaint Community Alliance.",
};

export default function ContactPage() {
  return (
    <>
      <section className="section primary">
        <div className="sectionInner">
          <span className="label">Kontakte nou x Contact us</span>
          <h1>Reach Lakay Toussaint.</h1>
          <p className="lead">
            Community members, volunteers, partners, funders, and media can
            start here.
          </p>
        </div>
      </section>
      <section className="section white">
        <div className="sectionInner grid two">
          <article className="card pad">
            <h2>Contact information</h2>
            <p>Seattle, WA</p>
            <p>
              Email: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
            </p>
          </article>
          <form className="formPanel" style={{ marginInline: 0 }}>
            <label className="field">
              <span>Name</span>
              <input type="text" placeholder="Your name" />
            </label>
            <label className="field" style={{ marginTop: "1rem" }}>
              <span>Email</span>
              <input type="email" placeholder="you@example.com" />
            </label>
            <label className="field" style={{ marginTop: "1rem" }}>
              <span>Message</span>
              <textarea placeholder="How can we help?" />
            </label>
            <button className="button primaryAction" style={{ marginTop: "1rem" }} type="submit">Send message</button>
          </form>
        </div>
      </section>
    </>
  );
}
