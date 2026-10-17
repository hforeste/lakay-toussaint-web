import Link from "next/link";
import { notFound } from "next/navigation";
import { EventSurveyForm } from "@/components/EventSurveyForm";
import { Icon } from "@/components/Icon";
import { getPublishedSurvey } from "@/lib/events/surveys";

export const dynamic = "force-dynamic";

export default async function SurveyPage({ params }: { params: Promise<{ slug: string; surveySlug: string }> }) {
  const { slug, surveySlug } = await params;
  const survey = await getPublishedSurvey(slug, surveySlug);
  if (!survey) notFound();

  return (
    <>
      <section className="eventBreadcrumb"><div className="sectionInner"><Link href={`/events/${survey.eventSlug}`}><Icon name="arrow_back" />Back to {survey.eventTitle}</Link><span className="eventStatus open"><span aria-hidden="true" />Survey open</span></div></section>
      <section className="section surveyPage">
        <div className="sectionInner surveyShell">
          <header className="surveyHeader">
            <span className="label">Community survey</span>
            <p className="surveyEventName">{survey.eventTitle}</p>
            <h1>{survey.title}</h1>
            {survey.description ? <p className="lead">{survey.description}</p> : null}
            <p className="surveyPrivacy"><Icon name="verified_user" />Responses are securely stored. Questions marked * are required.</p>
          </header>
          <EventSurveyForm survey={survey} />
        </div>
      </section>
    </>
  );
}
