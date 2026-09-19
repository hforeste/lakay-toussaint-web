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
                    <DesignImage src={event.heroImageUrl} alt="" />
                  </div>
                ) : null}
                <div className="cardBody">
                  <span className="flagBadge">{formatDate(event.startsAt, event.timeZone)}</span>
                  <h2>{event.title}</h2>
                  {event.subtitle ? <p className="label">{event.subtitle}</p> : null}
                  <p>{event.summary}</p>
                  <Link className="button secondaryAction" href={`/events/${event.slug}`}>
                    View details and register
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
            <p>
              Photography, video, and audio recording may take place during Lakay Toussaint
              Community Alliance events. If you do not wish to be photographed or recorded,
              please notify an event organizer when you arrive.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
