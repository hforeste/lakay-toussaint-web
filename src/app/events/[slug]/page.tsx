import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventBySlug, type PublicEvent } from "@/lib/firebase";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

interface EventDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: EventDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return {
    title: event ? event.title : "Event Not Found",
    description: event?.summary,
  };
}

export default async function EventDetailPage({ params }: EventDetailProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const ticketHref = event.ticketUrl || event.rsvpUrl || "/contact";
  const eventUrl = `${siteConfig.url}/events/${event.slug}`;
  const whatsappHref = buildWhatsAppHref(event, eventUrl);
  const heroImageUrl = event.heroImageUrl || "/images/ltca-community-gathering.png";

  return (
    <article className="eventLanding">
      <section className="eventHero">
        <Image
          className="eventHeroImage"
          src={heroImageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className="eventHeroContent">
          <Link className="eventBackLink" href="/events">
            Back to events
          </Link>
          <p className="eyebrow">Lakay Toussaint Event</p>
          <h1>{event.title}</h1>
          {event.subtitle ? <p className="eventSubtitle">{event.subtitle}</p> : null}
          <div className="eventHeroMeta" aria-label="Event details">
            <span>{formatFullDate(event.startsAt)}</span>
            <span>{formatTimeRange(event)}</span>
            <span>{event.neighborhood || event.locationName}</span>
          </div>
          <div className="actions">
            <a className="button donate" href={ticketHref}>
              {event.ticketCtaLabel || "Get tickets"}
            </a>
            <a className="button secondary" href={whatsappHref}>
              Share on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="eventMomentum" aria-label="Event momentum">
        <div>
          <strong>{event.expectedAttendeeCount || 0}</strong>
          <span>{event.attendeeCountLabel || "people planning to attend"}</span>
        </div>
        <div>
          <strong>{event.isFree ? "Free" : "Tickets"}</strong>
          <span>{event.isFree ? "RSVP requested" : "Reserve your spot early"}</span>
        </div>
        <div>
          <strong>Seattle area</strong>
          <span>{event.locationName}</span>
        </div>
      </section>

      <section className="section eventLandingBody">
        <main className="eventMainContent">
          <section className="eventStoryBlock">
            <p className="eyebrow">Overview</p>
            <h2>Why this event matters</h2>
            <p>{event.description}</p>
          </section>

          {event.highlights?.length ? (
            <section className="eventContentBlock">
              <div className="sectionTitle">
                <p className="eyebrow">What to expect</p>
                <h2>Come for the culture. Stay for the community.</h2>
              </div>
              <div className="eventHighlightGrid">
                {event.highlights.map((highlight) => (
                  <article className="eventHighlightCard" key={highlight.title}>
                    <h3>{highlight.title}</h3>
                    <p>{highlight.description}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {event.scheduleItems?.length ? (
            <section className="eventContentBlock">
              <div className="sectionTitle">
                <p className="eyebrow">Schedule</p>
                <h2>How the day flows</h2>
              </div>
              <div className="eventTimeline">
                {event.scheduleItems.map((item) => (
                  <article className="eventTimelineItem" key={`${item.time}-${item.title}`}>
                    <time>{item.time}</time>
                    <div>
                      <h3>{item.title}</h3>
                      {item.description ? <p>{item.description}</p> : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="eventContentBlock eventLocationBlock">
            <div>
              <p className="eyebrow">Location</p>
              <h2>{event.locationName}</h2>
              <p>{event.locationAddress}</p>
              {event.neighborhood ? <p className="meta">{event.neighborhood}</p> : null}
              {event.googleMapsUrl ? (
                <a className="button secondary" href={event.googleMapsUrl}>
                  Open in Google Maps
                </a>
              ) : null}
            </div>
            {event.googleMapsEmbedUrl ? (
              <iframe
                className="eventMap"
                src={event.googleMapsEmbedUrl}
                title={`Map for ${event.title}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : null}
          </section>

          {event.faqItems?.length ? (
            <section className="eventContentBlock">
              <div className="sectionTitle">
                <p className="eyebrow">Good to know</p>
                <h2>Questions before you go</h2>
              </div>
              <div className="eventFaqList">
                {event.faqItems.map((item) => (
                  <details className="eventFaqItem" key={item.question}>
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}
        </main>

        <aside className="eventTicketPanel" aria-label="Ticket information">
          <p className="eyebrow">Attend</p>
          <h2>{event.ticketCtaLabel || "Get tickets"}</h2>
          <p className="eventPanelDate">{formatFullDate(event.startsAt)}</p>
          <p className="meta">{formatTimeRange(event)}</p>
          <p className="meta">
            {event.locationName}
            <br />
            {event.locationAddress}
          </p>
          <div className="eventPanelCount">
            <strong>{event.expectedAttendeeCount || 0}</strong>
            <span>{event.attendeeCountLabel || "people planning to attend"}</span>
          </div>
          <a className="button donate" href={ticketHref}>
            {event.ticketCtaLabel || "Get tickets"}
          </a>
          <a className="button secondary" href={whatsappHref}>
            Share on WhatsApp
          </a>
        </aside>
      </section>

      <div className="eventMobileBar">
        <div>
          <strong>{formatShortDate(event.startsAt)}</strong>
          <span>{event.locationName}</span>
        </div>
        <a className="button donate" href={ticketHref}>
          {event.ticketCtaLabel || "Get tickets"}
        </a>
      </div>
    </article>
  );
}

function buildWhatsAppHref(event: PublicEvent, eventUrl: string) {
  const text = `${event.whatsappShareText || `Join me at ${event.title}.`} ${eventUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function formatFullDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatTimeRange(event: PublicEvent) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const startsAt = formatter.format(new Date(event.startsAt));

  if (!event.endsAt) {
    return startsAt;
  }

  return `${startsAt} - ${formatter.format(new Date(event.endsAt))}`;
}
