"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import styles from "../know-your-rights.module.css";
import { calendarLocation, KNOW_YOUR_RIGHTS_CALENDAR, type AttendanceMode } from "@/lib/events/calendar";

type ConfirmationState = {
  email?: string;
  attendeeCount?: number;
  attendance?: AttendanceMode;
};

function googleCalendarUrl(mode: AttendanceMode) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: KNOW_YOUR_RIGHTS_CALENDAR.title,
    dates: `${KNOW_YOUR_RIGHTS_CALENDAR.start}/${KNOW_YOUR_RIGHTS_CALENDAR.end}`,
    ctz: KNOW_YOUR_RIGHTS_CALENDAR.timeZone,
    details: `${KNOW_YOUR_RIGHTS_CALENDAR.description} ${calendarLocation(mode)}`,
    location: calendarLocation(mode),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function KnowYourRightsConfirmationPage() {
  const storedRegistration = useSyncExternalStore(
    () => () => undefined,
    () => window.sessionStorage.getItem("ltca:kyr-registration") ?? "",
    () => "",
  );
  const registration = useMemo<ConfirmationState>(() => {
    try {
      const parsed = storedRegistration ? JSON.parse(storedRegistration) as ConfirmationState : {};
      if (parsed.attendance !== "zoom" && parsed.attendance !== "in-person") return {};
      return {
        email: typeof parsed.email === "string" ? parsed.email : undefined,
        attendeeCount: typeof parsed.attendeeCount === "number" ? parsed.attendeeCount : undefined,
        attendance: parsed.attendance,
      };
    } catch {
      return {};
    }
  }, [storedRegistration]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const mode = registration.attendance ?? "zoom";
  const modeLabel = mode === "in-person" ? "An pèsòn / In person" : "Zoom";
  const location = calendarLocation(mode);
  const googleUrl = useMemo(() => googleCalendarUrl(mode), [mode]);

  return (
    <main className={styles.confirmationPage}>
      <div className={styles.confirmationInner}>
        <div className={styles.confirmationUtility}>
          <Link href="/events/know-your-rights">Retounen nan evènman an / Back to event</Link>
          <span>Lakay Toussaint × NWIRP</span>
        </div>

        <div className={styles.confirmationColumns}>
          <section className={styles.confirmationIntro} aria-labelledby="confirmation-title">
            <p className={styles.confirmationEyebrow}>Konnen dwa ou x Know Your Rights</p>
            <h1 id="confirmation-title">OU ENSKRI.<br /><span>YOU&apos;RE REGISTERED.</span></h1>
            <p className={styles.confirmationLead}>Mèsi paske w ap patisipe. / Thank you for registering.</p>
            <section className={styles.confirmationMessage} aria-label="Confirmation message">
              <p>
                {mode === "zoom"
                  ? "N ap voye yon imèl konfimasyon ak detay Zoom yo. / We’ll send a confirmation email and Zoom details."
                  : "N ap voye yon imèl konfimasyon ak detay evènman an. / We’ll send a confirmation email and event details."}
              </p>
            </section>
            <div className={styles.confirmationActions}>
              <button type="button" className={styles.confirmationPrimary} onClick={() => setCalendarOpen((open) => !open)} aria-expanded={calendarOpen} aria-controls="calendar-options">
                Ajoute nan kalandriye / Add to calendar
              </button>
            </div>
            {calendarOpen ? (
              <div id="calendar-options" className={styles.calendarOptions} role="group" aria-label="Opsyon kalandriye / Calendar options">
                <a href={googleUrl} target="_blank" rel="noopener noreferrer">Google Calendar</a>
                <a href={`/api/events/know-your-rights/calendar?mode=${mode}`} download>Kalandriye Apple / Outlook (.ics)</a>
                <p>{location}</p>
              </div>
            ) : null}
          </section>

          <section className={styles.confirmationCard} aria-labelledby="confirmation-details">
            <p className={styles.confirmationCardEyebrow}>Detay evènman an / Event details</p>
            <h2 id="confirmation-details">Know Your Rights Workshop</h2>
            <dl className={styles.confirmationDetails}>
              <div><dt>Dat / Date</dt><dd>{KNOW_YOUR_RIGHTS_CALENDAR.dateLabel}</dd></div>
              <div><dt>Lè / Time</dt><dd>{KNOW_YOUR_RIGHTS_CALENDAR.timeLabel}</dd></div>
              <div><dt>Fason / Attendance</dt><dd>{modeLabel}</dd></div>
              {registration.attendeeCount ? <div><dt>Patisipan / Attendees</dt><dd>{registration.attendeeCount}</dd></div> : null}
              <div><dt>Entèpretasyon / Interpretation</dt><dd>Haitian Creole available / Kreyòl disponib</dd></div>
              {registration.email ? <div><dt>Imèl / Email</dt><dd>{registration.email}</dd></div> : null}
            </dl>
            <div className={styles.confirmationNextSteps}>
              <p>Sa pou fè apre / Next steps</p>
              <ol>
                <li>Gade pou imèl konfimasyon an / Watch for the confirmation email.</li>
                <li>Ajoute atelye a nan kalandriye ou / Add the workshop to your calendar.</li>
                <li>Pote kesyon ou yo epi rantre oswa rive kèk minit bonè / Bring your questions and join or arrive a few minutes early.</li>
              </ol>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
