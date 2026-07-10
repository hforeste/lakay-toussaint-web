import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { getEventBySlug } from "@/lib/firebase";

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

  return (
    <>
      <PageHeader eyebrow="Event" title={event.title}>
        {event.summary}
      </PageHeader>
      <section className="section">
        <article className="card">
          <p className="meta">
            {new Intl.DateTimeFormat("en-US", {
              dateStyle: "full",
              timeStyle: "short",
            }).format(new Date(event.startsAt))}
          </p>
          <p className="meta">
            {event.locationName}, {event.locationAddress}
          </p>
          <p>{event.description}</p>
          <a className="button primary" href={event.rsvpUrl}>
            RSVP or get tickets
          </a>
        </article>
      </section>
    </>
  );
}
