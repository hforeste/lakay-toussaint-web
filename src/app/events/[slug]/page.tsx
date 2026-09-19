import { notFound } from "next/navigation";
import { DesignImage } from "@/components/DesignImage";
import { EventRegistrationForm } from "@/components/EventRegistrationForm";
import { getPublishedEventBySlug } from "@/lib/events/repository";

export const dynamic = "force-dynamic";

function formatDate(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone,
  }).format(date);
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);
  if (!event) notFound();

  const spacesRemaining =
    event.capacity === null ? null : Math.max(0, event.capacity - event.registeredAttendees);

  return (
    <>
      <section className="eventDetailHero">
        {event.heroImageUrl ? (
          <DesignImage className="heroImage" src={event.heroImageUrl} alt="" priority sizes="100vw" />
        ) : null}
        <div className="eventDetailHeroCopy">
          <span className="label fill">Community event</span>
          <h1>{event.title}</h1>
          {event.subtitle ? <p className="lead">{event.subtitle}</p> : null}
        </div>
      </section>

      <section className="section white">
        <div className="sectionInner eventDetailGrid">
          <article>
            <span className="flagBadge">{formatDate(event.startsAt, event.timeZone)}</span>
            <h2>About this event</h2>
            <p className="lead">{event.description}</p>
          </article>
          <aside className="card pad eventFacts">
            <h2>Event details</h2>
            <p><strong>Date:</strong><br />{formatDate(event.startsAt, event.timeZone)}</p>
            <p><strong>Location:</strong><br />{event.locationName}</p>
            {event.locationAddress ? <p>{event.locationAddress}</p> : null}
            {spacesRemaining !== null ? <p><strong>{spacesRemaining}</strong> spaces remaining</p> : null}
          </aside>
        </div>
      </section>

      <section className="section low" id="register">
        <div className="sectionInner">
          {event.registrationAvailable ? (
            <EventRegistrationForm slug={event.slug} maxPartySize={event.maxPartySize} />
          ) : (
            <article className="card pad">
              <h2>Registration is not currently available.</h2>
              <p>The event may be full, registration may not have opened, or the deadline may have passed.</p>
            </article>
          )}
        </div>
      </section>
    </>
  );
}
