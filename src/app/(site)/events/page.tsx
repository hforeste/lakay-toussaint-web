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
      {/* Hero */}
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

      {/* Events */}
      <section className="section white">
        <div className="sectionInner">
          <div className="grid two">
            {events.map((event) => (
              <article
                className={`card ${event.primary ? "primaryCard" : ""}`}
                key={event.title}
              >
                {event.image ? (
                  <div className="cardImage">
                    <DesignImage src={event.image} alt="" />
                  </div>
                ) : (
                  <div
                    className="cardImage"
                    style={{
                      display: "grid",
                      placeItems: "center",
                      background: event.primary ? "#fff" : "#001e37",
                    }}
                  >
                    <span
                      className="material-symbols-outlined icon"
                      aria-hidden="true"
                    >
                      diversity_3
                    </span>
                  </div>
                )}

                <div className="cardBody">
                  <span className="flagBadge">{event.date}</span>
                  <span className="label">{event.label}</span>

                  <h3>{event.title}</h3>

                  <p>{event.summary}</p>

                  <Link
                    className={
                      event.primary
                        ? "button lightAction"
                        : "button secondaryAction"
                    }
                    href="/contact"
                  >
                    Aprann plis x Learn More
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Photo & Media Release */}
          <aside
            id="photo-media-release"
            className="card"
            aria-labelledby="photo-media-release-title"
            style={{
              marginTop: "3rem",
              maxWidth: "900px",
              marginInline: "auto",
            }}
          >
            <div className="cardBody">
              <span className="label">Photo & Media Notice</span>

              <h2 id="photo-media-release-title">Photo &amp; Media Release</h2>

              <p className="lead">
                Photography, video, and audio recording may take place during
                Lakay Toussaint Community Alliance events. By registering for or
                attending an event, you acknowledge that you may appear in
                photographs, video recordings, audio recordings, or other media
                created during the event.
              </p>

              <details>
                <summary
                  style={{
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Read the full Photo &amp; Media Release
                </summary>

                <div style={{ marginTop: "1rem" }}>
                  <p>
                    By registering for or attending an event hosted by Lakay
                    Toussaint Community Alliance, you grant Lakay Toussaint
                    Community Alliance and its authorized representatives,
                    partners, licensees, and assigns permission to photograph,
                    record, and otherwise capture your image, likeness, voice,
                    and appearance in photographs, video, audio, or other media
                    created in connection with the event.
                  </p>

                  <p>
                    You authorize Lakay Toussaint Community Alliance to use,
                    reproduce, publish, display, distribute, edit, and share
                    such media for lawful organizational purposes, including
                    community outreach, education, event documentation,
                    fundraising, promotional materials, social media, websites,
                    publications, and other communications, in print or digital
                    formats.
                  </p>

                  <p>
                    You understand that media may be edited, cropped, combined
                    with other materials, or otherwise adapted for these
                    purposes. You also understand that you will not receive
                    payment or other compensation for the use of such media.
                  </p>

                  <p>
                    If you do not wish to be photographed or recorded, please
                    notify a Lakay Toussaint Community Alliance event organizer
                    or staff member when you arrive so that reasonable efforts
                    can be made to honor your request.
                  </p>

                  <p>
                    For children and other minors, consent requirements may
                    differ. A parent or legal guardian may be asked to provide
                    permission when required.
                  </p>
                </div>
              </details>
            </div>
          </aside>
        </div>
      </section>

      {/* Stay Connected */}
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
              <input
                type="email"
                placeholder="you@example.com"
                aria-label="Email Address"
              />
            </label>

            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </>
  );
}
