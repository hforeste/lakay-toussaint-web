import type { Metadata } from "next";
import Link from "next/link";
import { DesignImage } from "@/components/DesignImage";
import { DatabaseConfigurationError } from "@/lib/database";
import { getPublishedEvents } from "@/lib/events/repository";
import type { PublicEvent } from "@/lib/events/types";

export const metadata: Metadata = {
  title: "Events",
  description: "Community events from Lakay Toussaint Community Alliance.",
};

export const dynamic = "force-dynamic";

function formatDate(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone,
  }).format(date);
}

export default async function EventsPage() {
  let events: PublicEvent[];
  try {
    events = await getPublishedEvents();
  } catch (error) {
    if (!(error instanceof DatabaseConfigurationError)) throw error;
    events = [];
  }

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
            Come for the food, stay for the family.
          </p>
        </div>
      </section>

      <section className="section white">
        <div className="sectionInner grid two">
          {events.length ? (
            events.map((event) => (
              <article className="card" key={event.id}>
                {event.heroImageUrl ? (
                  <div className="cardImage">
                    <DesignImage src={event.heroImageUrl} alt={`${event.title} event`} />
                  </div>
                ) : null}
                <div className="cardBody">
                  <span className="flagBadge">{formatDate(event.startsAt, event.timeZone)}</span>
                  <h2>{event.title}</h2>
                  {event.subtitle ? <p className="label">{event.subtitle}</p> : null}
                  <p>{event.summary}</p>
                  <Link className="button secondaryAction" href={`/events/${event.slug}`}>
                    Aprann plis x Learn More
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <article className="card pad">
              <h2>No published events are available yet.</h2>
              <p>Please check back soon for the next community gathering.</p>
            </article>
          )}
        </div>
      </section>

      <section className="section low">
        <div className="sectionInner">
          <aside className="card pad" aria-labelledby="photo-media-release-title">
            <span className="label">Photo &amp; Media Notice</span>
            <h2 id="photo-media-release-title">Photo &amp; Media Release</h2>
            <p className="lead">
              Photography, video, and audio recording may take place during Lakay Toussaint
              Community Alliance events. By registering for or attending an event, you
              acknowledge that you may appear in photographs, video recordings, audio
              recordings, or other media created during the event.
            </p>
            <details>
              <summary>Read the full Photo &amp; Media Release</summary>
              <div className="eventReleaseDetails">
                <p>
                  By registering for or attending an event hosted by Lakay Toussaint Community
                  Alliance, you grant Lakay Toussaint Community Alliance and its authorized
                  representatives, partners, licensees, and assigns permission to photograph,
                  record, and otherwise capture your image, likeness, voice, and appearance in
                  photographs, video, audio, or other media created in connection with the event.
                </p>
                <p>
                  You authorize Lakay Toussaint Community Alliance to use, reproduce, publish,
                  display, distribute, edit, and share such media for lawful organizational
                  purposes, including community outreach, education, event documentation,
                  fundraising, promotional materials, social media, websites, publications, and
                  other communications, in print or digital formats.
                </p>
                <p>
                  You understand that media may be edited, cropped, combined with other
                  materials, or otherwise adapted for these purposes. You also understand that
                  you will not receive payment or other compensation for the use of such media.
                </p>
                <p>
                  If you do not wish to be photographed or recorded, please notify a Lakay
                  Toussaint Community Alliance event organizer or staff member when you arrive so
                  that reasonable efforts can be made to honor your request.
                </p>
                <p>
                  For children and other minors, consent requirements may differ. A parent or
                  legal guardian may be asked to provide permission when required.
                </p>
              </div>
            </details>
          </aside>
        </div>
      </section>
    </>
  );
}
