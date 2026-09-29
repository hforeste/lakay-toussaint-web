import type { Metadata } from "next";
import Image from "next/image";
import { RegistrationForm } from "./RegistrationForm";
import styles from "./know-your-rights.module.css";

export const metadata: Metadata = {
  title: "Know Your Rights",
  description:
    "Join Lakay Toussaint Community Alliance and the Northwest Immigrant Rights Project for a community Know Your Rights presentation in Seattle and on Zoom.",
};

const topics = [
  {
    icon: "gavel",
    title: "Know Your Rights",
    kreyol: "Konnen dwa ou",
  },
  {
    icon: "info",
    title: "Information on detention",
    kreyol: "Enfòmasyon sou detansyon",
  },
  {
    icon: "shield",
    title: "How to access NWIRP representation",
    kreyol: "Kijan pou jwenn reprezantasyon NWIRP",
  },
  {
    icon: "update",
    title: "Updates on TPS",
    kreyol: "Dènye nouvèl sou TPS",
  },
  {
    icon: "groups",
    title: "Resources",
    kreyol: "Resous",
  },
];

export default function KnowYourRightsPage() {
  return (
    <main className={styles.page}>
      {/* Tablet/mobile partnership header */}
      <div className={styles.mobilePartnerBar}>
        <span className={styles.partnerLogo} role="img" aria-label="Northwest Immigrant Rights Project">
          NWIRP
        </span>

        <div className={styles.mobilePartnerText}>
          <span>An patenarya</span>
          <span>In partnership</span>
        </div>

        <Image
          src="/images/brand/ltca-logo-256.png"
          alt="Lakay Toussaint Community Alliance"
          width={72}
          height={72}
          className={styles.lakayLogo}
        />
      </div>

      {/* Main event hero */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />

        <div className={styles.heroInner}>
          {/* Main event content */}
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              Konnen dwa ou x Know Your Rights
            </span>

            <h1 className={styles.title}>
              Know Your
              <br />
              Rights
            </h1>

            <p className={styles.description}>
              A community presentation with the Northwest Immigrant Rights
              Project on detention, TPS updates, and getting legal help. Join us
              in person or on Zoom.
            </p>

            {/* Desktop details */}
            <div className={styles.desktopDetails}>
              <EventDetail
                icon="calendar_month"
                title="Saturday, October 17, 2026 · 11 AM to 2 PM PT"
                subtitle="Samdi 17 oktòb 2026"
              />

              <EventDetail
                icon="location_on"
                title="Walk Your Plans · 3300 1st Ave S, Seattle"
                subtitle="Or join on Zoom · An pèsòn oswa sou Zoom"
              />

              <EventDetail
                icon="translate"
                title="Haitian Creole interpreters on site"
                subtitle="Entèprèt kreyòl sou plas"
              />

              <div className={styles.heroActions}>
                <a className={styles.registerButton} href="#register">
                  Enskri x Register
                </a>

                <a className={styles.shareButton} href="#event-details">
                  Event Details
                </a>
              </div>
            </div>
          </div>

          {/* Desktop topics card */}
          <aside className={styles.topicsCard}>
            <span className={styles.topicsEyebrow}>Sa n ap pale</span>

            <h2>What We&apos;ll Cover</h2>

            <div className={styles.topicList}>
              {topics.map((topic) => (
                <div className={styles.topic} key={topic.title}>
                  <span
                    className={`material-symbols-outlined ${styles.topicIcon}`}
                    aria-hidden="true"
                  >
                    {topic.icon}
                  </span>

                  <div>
                    <strong>{topic.title}</strong>
                    <span>{topic.kreyol}</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* Desktop partnership bar */}
      <section className={styles.desktopPartnerBar}>
        <div className={styles.partnerInner}>
          <div className={styles.partnerGroup}>
            <div className={styles.partnerLabel}>
              <span>An patenarya</span>
              <span>In partnership</span>
            </div>

            <span className={styles.partnerLogo} role="img" aria-label="Northwest Immigrant Rights Project">
              NWIRP
            </span>

            <div className={styles.partnerDivider} />

            <Image
              src="/images/brand/ltca-logo-256.png"
              alt="Lakay Toussaint Community Alliance"
              width={72}
              height={72}
              className={styles.lakayLogo}
            />
          </div>

          {/*<span className={styles.tagline}>No Haitian Left Behind</span>*/}
        </div>
      </section>

      {/* Tablet/mobile details */}
      <section
        id="event-details"
        className={styles.mobileDetails}
        aria-label="Event details"
      >
        <div className={styles.mobileDetailGrid}>
          <EventDetail
            icon="calendar_month"
            title="Saturday, October 17"
            subtitle="11 AM to 2 PM PT · Samdi 17 oktòb"
          />

          <EventDetail
            icon="location_on"
            title="Walk Your Plans"
            subtitle="3300 1st Ave S, Seattle"
          />

          <EventDetail
            icon="videocam"
            title="Or join on Zoom"
            subtitle="An pèsòn oswa sou Zoom"
          />

          <EventDetail
            icon="translate"
            title="Kreyòl interpreters"
            subtitle="Entèprèt kreyòl sou plas"
          />
        </div>

        <div className={styles.mobileTopics}>
          <span>Topics · Sijè</span>

          <p>
            Your rights · Detention · TPS updates · Legal help from NWIRP ·
            Resources
          </p>
        </div>

        <a className={styles.mobileRegisterButton} href="#register">
          Enskri x Register
        </a>

        <div className={styles.mobileBottomPartners}>
          <span className={styles.partnerLogo} role="img" aria-label="Northwest Immigrant Rights Project">
            NWIRP
          </span>

          <Image
            src="/images/brand/ltca-logo-256.png"
            alt="Lakay Toussaint Community Alliance"
            width={64}
            height={64}
          />
        </div>
      </section>

      {/* Registration */}
      <section id="register" className={styles.registration}>
        <div className={styles.registrationInner}>
          <div className={styles.registrationIntro}>
            <span className={styles.registrationEyebrow}>
              Enskri x Register
            </span>

            <h2>Rezève plas ou / Reserve your place</h2>

            <p>
              Enskri pou patisipe nan prezantasyon Konnen dwa ou a an pèsòn oswa
              sou Zoom. / Register to attend the Know Your Rights presentation
              in person or by Zoom. Tanpri bay enfòmasyon ki anba yo pou nou
              konfime enskripsyon ou epi voye mizajou sou evènman an. / Please
              provide the information below so we can confirm your registration
              and send event updates.
            </p>
          </div>

          <RegistrationForm />
        </div>
      </section>
    </main>
  );
}

type EventDetailProps = {
  icon: string;
  title: string;
  subtitle?: string;
};

function EventDetail({ icon, title, subtitle }: EventDetailProps) {
  return (
    <div className={styles.detail}>
      <span
        className={`material-symbols-outlined ${styles.detailIcon}`}
        aria-hidden="true"
      >
        {icon}
      </span>

      <div>
        <strong>{title}</strong>

        {subtitle ? <span>{subtitle}</span> : null}
      </div>
    </div>
  );
}
