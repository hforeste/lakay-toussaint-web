import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { getEvents } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming Lakay Toussaint Community Alliance events and RSVP links.",
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <PageHeader eyebrow="Events" title="Community gatherings">
        Events are LTCA&apos;s biggest engine right now. Dates, locations, and
        RSVP links are powered by Firebase event records.
      </PageHeader>
      <section className="section eventFeatureSection">
        <div className="sectionTitle">
          <p className="eyebrow">What to expect</p>
          <h2>Food, culture, organizing, and a visible Haitian presence.</h2>
          <p className="lead">
            These gatherings are not side projects. They are LTCA&apos;s
            strongest engine for trust, fundraising, volunteers, and community
            momentum.
          </p>
        </div>
        {events.length ? (
          <div className="grid two">
            {events.map((event) => (
              <article className="card eventCard" key={event.id}>
                <h2>{event.title}</h2>
                <p>{event.summary}</p>
                <p className="meta">
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "full",
                    timeStyle: "short",
                  }).format(new Date(event.startsAt))}
                </p>
                <p className="meta">
                  {event.locationName}, {event.locationAddress}
                </p>
                <Link className="button primary" href={`/events/${event.slug}`}>
                  View event
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <article className="card">
            <h2>No public events yet</h2>
            <p>Check back soon for upcoming LTCA gatherings.</p>
          </article>
        )}
      </section>
    </>
  );
}
