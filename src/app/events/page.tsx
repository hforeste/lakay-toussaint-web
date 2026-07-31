import type { Metadata } from "next";
import Link from "next/link";
import { DesignImage } from "@/components/DesignImage";
import { imagery } from "@/lib/design-content";

export const metadata: Metadata = {
  title: "Events",
  description: "Community events from Lakay Toussaint Community Alliance.",
};

const events = [
  {
    label: "1804 x Haitian Independence",
    title: "1804: A Haitian Independence Day Celebration",
    date: "Every New Year",
    image: imagery.independence,
    summary:
      "On January 1, 1804, Haiti declared itself the first free Black republic in the world. Every New Year, we gather to honor that legacy the Haitian way, with soup joumou, music, history, and celebration.",
  },
  {
    label: "Jou Drapo Ayisyen x Haitian Flag Day",
    title: "Jou Drapo Ayisyen x Haitian Flag Day",
    date: "Every May 18",
    summary:
      "In 1803 at Arcahaie, Catherine Flon sewed the blue and red together and the Haitian flag was born. Every May 18, we celebrate the flag and the story behind it, with our young people leading the way.",
  },
  {
    label: "Goute Ayiti x Taste of Haiti",
    title: "A Taste of Haiti",
    date: "Every Labor Day",
    image: imagery.taste,
    summary:
      "The picnic that started it all. Every Labor Day, the community gathers for Haitian food, live music, family activities, and joy, free and open to everyone.",
  },
  {
    label: "Jounen Resous Kominote x Community Resource Fair",
    title: "Jounen Resous Kominote x Community Resource Fair",
    date: "Every November",
    summary:
      "One afternoon, every resource, all in Kreyol. Partner organizations gather under one roof for immigration legal help, healthcare enrollment, housing, schools, and job training.",
    primary: true,
  },
];

export default function EventsPage() {
  return (
    <>
      <section className="section primary">
        <div className="sectionInner" style={{ textAlign: "center" }}>
          <span className="label">Sa k ap vini x Our Events</span>
          <h1>
            Lakay nou ouvri pou tout moun.
            <br />
            <span className="goldText">Our doors are open to all.</span>
          </h1>
          <p className="lead" style={{ marginInline: "auto" }}>
            Four times a year, the lakay opens its doors wide. Come for the
            food, stay for the family.
          </p>
        </div>
      </section>

      <section className="section white">
        <div className="sectionInner grid two">
          {events.map((event) => (
            <article className={`card ${event.primary ? "primaryCard" : ""}`} key={event.title}>
              {event.image ? (
                <div className="cardImage">
                  <DesignImage src={event.image} alt="" />
                </div>
              ) : (
                <div className="cardImage" style={{ display: "grid", placeItems: "center", background: event.primary ? "#fff" : "#001e37" }}>
                  <span className="material-symbols-outlined icon" aria-hidden="true">diversity_3</span>
                </div>
              )}
              <div className="cardBody">
                <span className="flagBadge">{event.date}</span>
                <span className="label">{event.label}</span>
                <h3>{event.title}</h3>
                <p>{event.summary}</p>
                <Link className={event.primary ? "button lightAction" : "button secondaryAction"} href="/contact">
                  Aprann plis x Learn More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section low">
        <div className="sectionInner split">
          <div>
            <h2>Rete konekte x Stay Connected</h2>
            <p className="lead">
              Join our mailing list to receive updates on upcoming events,
              community news, and ways to get involved in the alliance.
            </p>
          </div>
          <form className="footerSubscribe" style={{ alignItems: "end" }}>
            <label className="field" style={{ flex: 1 }}>
              <span>Email Address</span>
              <input type="email" placeholder="you@example.com" />
            </label>
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </>
  );
}
