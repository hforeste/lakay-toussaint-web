import Link from "next/link";
import { CommunityVideoMoment } from "@/components/CommunityVideoMoment";
import { DesignImage } from "@/components/DesignImage";
import { imagery, programCards } from "@/lib/design-content";

export default function HomePage() {
  const communityPreviewWebm =
    process.env.NEXT_PUBLIC_COMMUNITY_VIDEO_PREVIEW_WEBM_URL ||
    "https://po7fftndziwoitbz.public.blob.vercel-storage.com/community/community-preview.webm";
  const communityPreviewMp4 =
    process.env.NEXT_PUBLIC_COMMUNITY_VIDEO_PREVIEW_MP4_URL ||
    "https://po7fftndziwoitbz.public.blob.vercel-storage.com/community/community-preview.mp4";
  const communityFullMp4 =
    process.env.NEXT_PUBLIC_COMMUNITY_VIDEO_FULL_MP4_URL ||
    "https://po7fftndziwoitbz.public.blob.vercel-storage.com/community/community-full.mp4";
  const communityPoster =
    process.env.NEXT_PUBLIC_COMMUNITY_VIDEO_POSTER_URL ||
    "/images/video/community-video-poster.webp";

  return (
    <>
      <section className="hero">
        <DesignImage
          className="heroImage"
          src={imagery.homeHero}
          alt="Vibrant Haitian community gathering"
          priority
          sizes="100vw"
        />
        <div className="heroCopy">
          <span className="label fill">Byenveni lakay ou</span>
          <h1>Welcome home</h1>
          <p className="lead">
            Seattle&apos;s home for Haitian culture, community, and connection.
            Together, we ensure that No Haitian is Left Behind in the Pacific
            Northwest.
          </p>
          <div className="actions">
            <Link className="button primaryAction" href="/events">See what&apos;s happening</Link>
            <Link className="button lightAction" href="/join-us">Vin manm x Become a member</Link>
          </div>
        </div>
      </section>

      <section className="section white">
        <div className="sectionInner">
          <CommunityVideoMoment
            fullMp4Src={communityFullMp4}
            posterSrc={communityPoster}
            previewMp4Src={communityPreviewMp4}
            previewWebmSrc={communityPreviewWebm}
          />
        </div>
      </section>

      <section className="section low">
        <div className="sectionInner">
          <div className="sectionHeader center">
            <span className="label">Pwogram nou yo</span>
            <h2>Our Programs</h2>
            <div className="goldRule" />
          </div>
          <div className="grid three">
            {programCards.map((program, index) => (
              <article className="card" key={program.title}>
                <div className="cardImage">
                  <DesignImage src={program.image} alt="" />
                </div>
                <div className="cardBody">
                  {index === 0 ? <span className="flagBadge">Priyorite ane sa a</span> : null}
                  <h3>{program.title}</h3>
                  <p>{program.summary}</p>
                  <Link className="button secondaryAction" href="/programs">Learn More</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section primary">
        <div className="sectionInner split">
          <div>
            <h2>From 1804 to Seattle: our story.</h2>
            <div className="goldRule" />
            <p className="lead">
              The spirit of 1804 travels with us wherever we go. In the Pacific
              Northwest, Lakay Toussaint Community Alliance stands as a testament
              to resilience, dignity, and unity.
            </p>
            <p className="lead">
              Rooted in Seattle and connected to Haiti, we weave Caribbean
              traditions into local community life so our children grow with
              pride in their roots and wings for their future.
            </p>
            <Link className="button lightAction" href="/about">Read our story</Link>
          </div>
          <div className="imageFrame">
            <DesignImage src={imagery.elder} alt="Haitian elder portrait with a Seattle backdrop" />
          </div>
        </div>
      </section>

      <section className="section white">
        <div className="sectionInner">
          <article className="card pad goldBorder" style={{ maxWidth: "900px", marginInline: "auto", textAlign: "center" }}>
            <span className="material-symbols-outlined icon" aria-hidden="true">volunteer_activism</span>
            <h2>Haitian culture is a story worth telling, and a community worth building.</h2>
            <p>
              Your contribution supports immigration advocacy, youth mentorship,
              and cultural preservation in the Pacific Northwest.
            </p>
            <div className="actions" style={{ justifyContent: "center" }}>
              <Link className="button donate" href="/donate">Support Us x Fe yon don</Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
