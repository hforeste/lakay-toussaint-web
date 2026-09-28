import Link from "next/link";

const topics = [
  "Know Your Rights",
  "Information on detention",
  "TPS updates",
  "NWIRP representation",
  "Community resources",
];

export function UpcomingEventTeaser() {
  return (
    <section
      className="section white upcomingEventSection"
      aria-labelledby="upcoming-event-title"
    >
      <div className="sectionInner">
        <div className="upcomingEventCard">
          <div className="upcomingEventMain">
            <span className="label upcomingEventEyebrow">
              Upcoming Event
            </span>

            <h2
              id="upcoming-event-title"
              className="upcomingEventTitle"
            >
              Know Your Rights
            </h2>

            <div className="upcomingEventMeta">
              <p className="upcomingEventDate">
                Saturday, October 17, 2026 · 11 AM–2 PM PT
              </p>

              <p className="upcomingEventLocation">
                Seattle + Zoom
              </p>
            </div>

            <p className="upcomingEventDescription">
              A community presentation with the Northwest Immigrant Rights
              Project covering your rights, detention, TPS updates, legal
              representation, and community resources. Haitian Creole
              interpreters will be available.
            </p>

            <div className="upcomingEventActions">
              <Link
                href="/events/know-your-rights"
                className="upcomingEventCta"
              >
                View Event & Register
              </Link>
            </div>
          </div>

          <aside className="upcomingEventTopics">
            <span className="upcomingEventTopicsEyebrow">
              Sa n ap pale
            </span>

            <h3 className="upcomingEventTopicsTitle">
              What We&apos;ll Cover
            </h3>

            <div className="upcomingEventTopicList">
              {topics.map((topic) => (
                <div
                  key={topic}
                  className="upcomingEventTopic"
                >
                  {topic}
                </div>
              ))}
            </div>

            <div className="upcomingEventPartner">
              <span className="upcomingEventPartnerLabel">
                In partnership with
              </span>

              <span className="upcomingEventPartnerName">
                Northwest Immigrant Rights Project
              </span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
