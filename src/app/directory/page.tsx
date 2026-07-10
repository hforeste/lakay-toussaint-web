import type { Metadata } from "next";
import { BusinessSubmissionForm } from "@/components/BusinessSubmissionForm";
import { PageHeader } from "@/components/PageHeader";
import { directoryResources } from "../../../data";

export const metadata: Metadata = {
  title: "Haitian Business Directory",
  description:
    "A Phase 1 community directory for Haitian-owned businesses, services, churches, and mutual-aid resources in the Seattle area.",
};

export default function DirectoryPage() {
  return (
    <>
      <PageHeader eyebrow="Directory" title="Haitian Business Directory">
        A critical Phase 1 community resource for Haitian-owned businesses,
        Haitian-serving services, churches, and mutual-aid resources.
      </PageHeader>
      <section className="section">
        {directoryResources.length ? (
          <div className="grid">
            {directoryResources.map((resource) => (
              <article className="card" key={resource.id}>
                <h2>{resource.name}</h2>
                <p className="meta">{resource.category}</p>
                <p>{resource.summary}</p>
                {resource.location ? <p>{resource.location}</p> : null}
                {resource.websiteUrl ? (
                  <a href={resource.websiteUrl} rel="noreferrer" target="_blank">
                    Visit website
                  </a>
                ) : null}
                {resource.contactEmail ? (
                  <a href={`mailto:${resource.contactEmail}`}>Email contact</a>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <article className="card">
            <h2>Directory listings are coming soon</h2>
            <p>
              LTCA is reviewing Haitian-owned businesses, Haitian-serving
              services, churches, and mutual-aid resources before publishing
              them here.
            </p>
          </article>
        )}
      </section>
      <section className="section">
        <div className="sectionTitle">
          <p className="eyebrow">Submit Your Business</p>
          <h2>Request a directory listing</h2>
          <p className="lead">
            Submissions are reviewed before being added publicly. They do not
            auto-publish to the directory.
          </p>
        </div>
        <BusinessSubmissionForm />
      </section>
    </>
  );
}
