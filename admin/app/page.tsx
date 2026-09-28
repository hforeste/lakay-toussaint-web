import { redirect } from "next/navigation";
import { EventManager } from "@/components/EventManager";
import { isAuthenticated } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import { listEvents } from "@/lib/events";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!(await isAuthenticated())) redirect("/login");
  const events = await listEvents();
  const publicSiteUrl = getConfig("PUBLIC_SITE_URL") || "http://localhost:3000";

  return (
    <main>
      <header className="adminHeader">
        <div className="adminHeaderInner">
          <div className="brandLockup">
            <span className="brandMark" aria-hidden="true">LT</span>
            <div><strong>Lakay Toussaint</strong><span>Event administration</span></div>
          </div>
          <div className="headerActions">
            <a href={`${publicSiteUrl}/events`} target="_blank" rel="noreferrer">View public events</a>
            <form action="/api/logout" method="post"><button type="submit">Sign out</button></form>
          </div>
        </div>
      </header>
      <EventManager initialEvents={events} publicSiteUrl={publicSiteUrl} />
    </main>
  );
}
