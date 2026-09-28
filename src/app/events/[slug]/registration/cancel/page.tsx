import Link from "next/link";
import { CancelRegistrationButton } from "@/components/CancelRegistrationButton";
import { getCancellationDetails } from "@/lib/events/repository";

export const dynamic = "force-dynamic";

export default async function CancelRegistrationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const token = query.token || "";
  const registration = await getCancellationDetails(slug, token);

  return (
    <section className="section white">
      <div className="sectionInner">
        <article className="formPanel">
          {registration ? (
            <>
              <span className="label">Event registration</span>
              <h1>Cancel your registration?</h1>
              <p className="lead">
                This will cancel your party&apos;s registration for {registration.event_title} and
                release the reserved spaces.
              </p>
              <CancelRegistrationButton slug={slug} token={token} />
            </>
          ) : (
            <>
              <h1>Registration unavailable</h1>
              <p>This registration is already cancelled or the cancellation link is invalid.</p>
              <Link className="button secondaryAction" href="/events">View events</Link>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
