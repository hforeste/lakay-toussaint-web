import Link from "next/link";
import { notFound } from "next/navigation";
import { EventRegistrationForm } from "@/components/EventRegistrationForm";
import { Icon } from "@/components/Icon";
import { getPublishedEventBySlug } from "@/lib/events/repository";

export const dynamic = "force-dynamic";

function formatDate(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeZone,
  }).format(date);
}

function formatTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeStyle: "short",
    timeZone,
  }).format(date);
}

function formatDateOnly(date: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeZone: "UTC" })
    .format(new Date(`${date}T00:00:00.000Z`));
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);
  if (!event) notFound();
  const eventHasEnded = event.hasEnded;

  const spacesRemaining =
    event.capacity === null ? null : Math.max(0, event.capacity - event.registeredAttendees);
  const mapQuery = [event.locationName, event.locationAddress].filter(Boolean).join(", ");

  return (
    <>
      <section className="eventBreadcrumb">
        <div className="sectionInner">
          <Link href="/events">
            <Icon name="arrow_back" />
            Retounen / Back to events
          </Link>
          <span className={event.registrationAvailable ? "eventStatus open" : "eventStatus"}>
            <span aria-hidden="true" />
            {eventHasEnded
              ? "Evènman an fini / Event ended"
              : event.registrationAvailable
              ? "Enskripsyon ouvè / Registration open"
              : "Enskripsyon fèmen / Registration unavailable"}
          </span>
        </div>
      </section>

      <section className="section white">
        <div className="sectionInner eventEditorialHero">
          <article className="eventHeroCopy">
            <span className="label">Evènman kominotè / Community event</span>
            <h1>{event.title}</h1>
            {event.subtitle ? <p className="eventSubtitle">{event.subtitle}</p> : null}
            <p className="lead">{event.summary}</p>

            <div className="eventInfoGrid" aria-label="Event date and location">
              <div className="eventInfoItem">
                <Icon className="eventInfoIcon" name="calendar_month" />
                <div>
                  <span>Dat ak lè / Date &amp; time</span>
                  <strong>{event.scheduleStatus === "date_only" && event.eventDate
                    ? formatDateOnly(event.eventDate)
                    : event.startsAt ? formatDate(event.startsAt, event.timeZone) : "Save the date"}</strong>
                  {event.scheduleStatus === "date_only" ? <small>Time coming soon</small> : null}
                  {event.startsAt && event.endsAt ? (
                    <small>
                      {formatTime(event.startsAt, event.timeZone)} – {formatTime(event.endsAt, event.timeZone)}
                    </small>
                  ) : null}
                </div>
              </div>
              <div className="eventInfoItem">
                <Icon className="eventInfoIcon" name="location_on" />
                <div>
                  <span>Kote li ye / Location</span>
                  <strong>{event.locationName || "Details coming soon"}</strong>
                  {event.locationAddress ? <small>{event.locationAddress}</small> : null}
                </div>
              </div>
            </div>

            <div className="actions">
              {event.registrationAvailable ? (
                <Link className="button primaryAction" href="#register">
                  Enskri kounye a / Register now
                  <Icon name="arrow_downward" />
                </Link>
              ) : null}
              <Link className="button secondaryAction" href="#details">
                Gade detay yo / Explore details
                <Icon name="arrow_forward" />
              </Link>
            </div>
          </article>

          {event.heroImageUrl ? (
            <figure className="eventMediaFrame">
              <div className="eventMediaImage">
                {/* Event artwork can be portrait, square, or landscape. Let the
                    browser use the uploaded file's intrinsic aspect ratio so
                    posters are never cropped to a fixed hero-image shape. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="eventDetailImage"
                  src={event.heroImageUrl}
                  alt={`${event.title} event`}
                  decoding="async"
                  fetchPriority="high"
                />
              </div>
            </figure>
          ) : null}
        </div>
      </section>

      <section className="section low" id="details">
        <div className="sectionInner eventDetailGrid">
          <article className="eventDescription">
            <span className="label">Konsènan evènman an / About this event</span>
            <h2>Ann reyini ansanm / Come together in community.</h2>
            <div className="goldRule" />
            <p className="lead">{event.description}</p>
          </article>
          <aside className="card pad eventFacts">
            <span className="label">Detay evènman an / Event details</span>
            <h2>Prepare w / Plan your visit</h2>
            <p><strong>Kote li ye / Location</strong><br />{event.locationName || "Details coming soon"}</p>
            {event.locationAddress ? <p>{event.locationAddress}</p> : null}
            {spacesRemaining !== null ? (
              <p className="eventCapacity"><strong>{spacesRemaining}</strong> plas ki rete / spaces remaining</p>
            ) : null}
            {mapQuery ? (
              <a
                className="eventDirections"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                target="_blank"
                rel="noreferrer"
              >
                Jwenn direksyon / Get directions <Icon name="arrow_outward" />
              </a>
            ) : null}
          </aside>
        </div>
      </section>

      <section className="section low" id="register">
        <div className="sectionInner">
          {event.registrationAvailable && !eventHasEnded ? (
            <div className="eventRegistrationLayout">
              <aside className="eventRegistrationAside">
                <span className="label fill">Enskripsyon ouvè / Open</span>
                <h2>Rezève plas ou / Reserve your place.</h2>
                <p>
                  Bring your family and community. Each registration can include up to{" "}
                  {event.maxPartySize} people.
                </p>
                {spacesRemaining !== null ? (
                  <p className="eventCapacity"><strong>{spacesRemaining}</strong> plas ki rete / spaces remaining</p>
                ) : null}
                <ul>
                  <li><Icon name="check_circle" />Konfimasyon pa imèl / Confirmation sent by email</li>
                  <li><Icon name="check_circle" />Anile nenpòt lè / Cancel from your confirmation</li>
                  <li><Icon name="verified_user" />Detay efase apre 90 jou / Details deleted after 90 days</li>
                </ul>
              </aside>
              <EventRegistrationForm slug={event.slug} maxPartySize={event.maxPartySize} />
            </div>
          ) : (
            <article className="card pad">
              <h2>{eventHasEnded ? "Evènman sa a fini / This event has ended." : "Enskripsyon pa disponib / Registration unavailable."}</h2>
              <p>{eventHasEnded ? "Mèsi paske w te pataje moman sa a avèk nou. / Thank you for sharing this moment with us." : "The event may be full, registration may not have opened, or the deadline may have passed."}</p>
            </article>
          )}
        </div>
      </section>

      <section className="section white">
        <div className="sectionInner">
          <aside className="card pad eventRelease" aria-labelledby="photo-media-release-title">
            <span className="label">Foto ak medya / Photo &amp; media</span>
            <h2 id="photo-media-release-title">Photo &amp; Media Release</h2>
            <p>Photography, video, and audio recording may take place during Lakay Toussaint Community Alliance events.</p>
            <details className="eventReleaseDetails">
              <summary>Read the full Photo &amp; Media Release</summary>
              <p>By registering for or attending an event hosted by Lakay Toussaint Community Alliance, you grant Lakay Toussaint Community Alliance and its authorized representatives, partners, licensees, and assigns permission to photograph, record, and otherwise capture your image, likeness, voice, and appearance in photographs, video, audio, or other media created in connection with the event.</p>
              <p>You authorize Lakay Toussaint Community Alliance to use, reproduce, publish, display, distribute, edit, and share such media for lawful organizational purposes, including community outreach, education, event documentation, fundraising, promotional materials, social media, websites, publications, and other communications, in print or digital formats.</p>
              <p>If you do not wish to be photographed or recorded, please notify a Lakay Toussaint Community Alliance event organizer or staff member when you arrive so that reasonable efforts can be made to honor your request.</p>
            </details>
          </aside>
        </div>
      </section>
    </>
  );
}


