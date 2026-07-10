import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { siteConfig } from "@/lib/site";
import { donationCopy, pillars } from "../../../data";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support Lakay Toussaint Community Alliance through its fiscal sponsor Byrd Barr Place.",
};

export default function DonatePage() {
  const donationHref = siteConfig.donationUrl || "/contact";

  return (
    <>
      <PageHeader eyebrow="Donate" title={donationCopy.headline}>
        {donationCopy.body}
      </PageHeader>
      <section className="section actionSection">
        <div className="grid two">
          <article className="card donateCard">
            <h2>Give through our fiscal sponsor</h2>
            <p>{donationCopy.fiscalSponsorDisclosure}</p>
            <a className="button donate" href={donationHref}>
              Donate now
            </a>
            {!siteConfig.donationUrl ? (
              <p className="sourceNote">
                Donation URL needed: set NEXT_PUBLIC_DONATION_URL once the Byrd
                Barr Place-approved donation route is available.
              </p>
            ) : null}
          </article>
          <article className="card">
            <h2>Your donation supports</h2>
            <ul>
              {donationCopy.useCases.map((useCase) => (
                <li key={useCase}>{useCase}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
      <section className="section featureSection">
        <div className="sectionTitle">
          <p className="eyebrow">Where support goes</p>
          <h2>Fund community strength across five pillars.</h2>
          <p className="lead">
            Donations should feel concrete: people welcomed, resources shared,
            youth supported, and community infrastructure built.
          </p>
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
    </>
  );
}
