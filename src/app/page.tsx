import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getEvents } from "@/lib/firebase";
import { donationCopy, organizationCopy, pillars, programs } from "../../data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = (await getEvents()).slice(0, 2);

  return (
    <div className="homePage">
      <section className="hero homeHero">
        <div className="heroCopy">
          <p className="eyebrow">{organizationCopy.missionStatement}</p>
          <h1>{organizationCopy.name}</h1>
          <p className="heroMission">
            <span>{organizationCopy.tagline}</span>{" "}
            We serve Seattle&apos;s Haitian diaspora and the broader Pacific
            Northwest Haitian community through{" "}
            <strong>culture</strong>, <strong>service</strong>,{" "}
            <strong>justice</strong>, <strong>opportunity</strong>, and{" "}
            <strong>Haiti rebuilding</strong>.
          </p>
          <div className="actions">
            <Link className="button donate" href="/donate">
              Donate
            </Link>
            <Link className="button primary" href="/events">
              See events
            </Link>
            <Link className="button secondary" href="/volunteer">
              Volunteer
            </Link>
            <Link className="button secondary" href="/directory">
              Find resources
            </Link>
          </div>
        </div>
        <Image
          className="heroImage heroMedia"
          src="/images/community-hero.png"
          alt="Haitian community members gathering at a warm outdoor cultural event"
          width={1200}
          height={900}
          priority
        />
      </section>

      <section className="section missionSection">
        <div className="sectionTitle">
          <p className="eyebrow">Mission</p>
          <h2>{organizationCopy.mission}</h2>
          <p className="lead">{organizationCopy.vision}</p>
        </div>
        <div className="grid">
          {pillars.map((pillar) => (
            <article className="card" key={pillar.id}>
              <h3>{pillar.title}</h3>
              <p>{pillar.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section programsSection">
        <div className="sectionTitle">
          <p className="eyebrow">Featured Programs</p>
          <h2>Service over self. Community over gain.</h2>
        </div>
        <div className="grid two">
          {programs.slice(0, 4).map((program) => (
            <article className="card" key={program.id}>
              <h3>{program.title}</h3>
              <p>{program.summary}</p>
              <p className="meta">Audience: {program.audience.join(", ")}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section eventsSection">
        <div className="sectionTitle">
          <p className="eyebrow">Upcoming Events</p>
          <h2>Gather with the community</h2>
        </div>
        <div className="grid two">
          {events.map((event) => (
            <article className="card" key={event.id}>
              <h3>{event.title}</h3>
              <p>{event.summary}</p>
              <p className="meta">
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "long",
                  timeStyle: "short",
                }).format(new Date(event.startsAt))}
              </p>
              <Link className="button secondary" href={`/events/${event.slug}`}>
                Event details
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section actionSection">
        <div className="grid two">
          <article className="card donateCard">
            <p className="eyebrow">Donate</p>
            <h2>{donationCopy.headline}</h2>
            <p>{donationCopy.body}</p>
            <Link className="button donate" href="/donate">
              Give through our fiscal sponsor
            </Link>
            <Link className="button secondary" href="/volunteer">
              Volunteer with LTCA
            </Link>
          </article>
          <article className="card newsletterCard">
            <p className="eyebrow">Stay Connected</p>
            <h2>Subscribe to the LTCA newsletter</h2>
            <p>
              Get event updates, volunteer opportunities, and community news in
              your inbox.
            </p>
            <NewsletterForm />
          </article>
        </div>
      </section>
    </div>
  );
}
