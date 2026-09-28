import type { Metadata } from "next";
import { DesignImage } from "@/components/DesignImage";
import { imagery } from "@/lib/design-content";

export const metadata: Metadata = {
  title: "Become a Member",
  description: "Become a member of Lakay Toussaint Community Alliance.",
};

const interests = [
  "Youth Programs x Pwogram Jen",
  "Legal Aid x Ed Legal",
  "Housing Support x Sipo Lojman",
  "Job Resources x Resous Travay",
  "Cultural Events x Evenman Kiltirel",
  "Advocacy x Defann Dwa Nou",
];

const skills = [
  "Interpretation x Entpretasyon",
  "Transport x Transpo",
  "Mentoring x Mentora",
  "Organizing x Oganize",
];

export default function JoinUsPage() {
  return (
    <>
      <section className="hero">
        <DesignImage
          className="heroImage"
          src={imagery.memberHero}
          alt="Haitian families at a community picnic"
          priority
          sizes="100vw"
        />
        <div className="heroCopy">
          <span className="label fill">Vin Manm Lakay la</span>
          <h1>
            Vin manm lakay la
            <br />
            <span className="goldText">x</span>
            <br />
            Become a member of the home.
          </h1>
          <p className="lead">
            Membership is free, and it means you belong. We are building a
            space where every Haitian in our community is seen, heard, and
            supported.
          </p>
        </div>
      </section>

      <section className="section white">
        <div className="sectionInner grid two">
          <article className="card pad goldBorder">
            <h2>Why join Lakay Toussaint?</h2>
            {[
              ["Hear first", "Get direct updates on programs, resources, and community events before anyone else."],
              ["Access fund", "Priority access to community support funds and crisis intervention resources."],
              ["Voice shapes", "Your input directly shapes our future programs and advocacy efforts."],
              ["You are counted", "Help us show the true strength and size of our community to city leaders."],
            ].map(([title, body]) => (
              <div className="checkbox" key={title}>
                <span className="material-symbols-outlined icon" aria-hidden="true">check_circle</span>
                <p><strong>{title}</strong><br />{body}</p>
              </div>
            ))}
          </article>
          <article className="card pad primaryCard">
            <span className="material-symbols-outlined icon" aria-hidden="true">shield_person</span>
            <h2>The Privacy Promise x Pwomes Konfidansyalite</h2>
            <p>
              &quot;We will never ask your immigration status, and we will never
              share your information with any government agency.&quot;
            </p>
            <p>
              &quot;Nou p&apos;ap janm mande estati imigrasyon ou, epi nou p&apos;ap janm
              pataje enfomasyon ou ak okenn ajans gouvenman.&quot;
            </p>
          </article>
        </div>
      </section>

      <section className="section low" id="join-form">
        <div className="formPanel">
          <div className="sectionHeader center">
            <h2>Vin Manm Kounye A</h2>
            <span className="label">Become a member today</span>
          </div>
          <form>
            <div className="formGrid">
              <label className="field">
                <span>Full Name x Non konple</span>
                <input type="text" placeholder="Jan Jak Desalin" />
              </label>
              <label className="field">
                <span>Phone or Email x Telefon oswa Imel</span>
                <input type="text" placeholder="555-0199 / email@domain.com" />
              </label>
              <label className="field">
                <span>City x Vil</span>
                <input type="text" placeholder="Seattle" />
              </label>
              <label className="field">
                <span>ZIP Code x Kod Postal</span>
                <input type="text" placeholder="98101" />
              </label>
              <label className="field">
                <span>Preferred Language x Lang ou pi pito</span>
                <select defaultValue="Kreyol Ayisyen">
                  <option>Kreyol Ayisyen</option>
                  <option>English</option>
                  <option>Francais</option>
                  <option>Bilingual (Kreyol/English)</option>
                </select>
              </label>
              <label className="field">
                <span>Household Size Optional</span>
                <input type="number" placeholder="How many people?" />
              </label>
            </div>

            <div className="checkboxGroup" style={{ marginTop: "2.5rem" }}>
              <h3>Kisa ou enterese? x What are you interested in?</h3>
              <div className="checkboxGrid">
                {interests.map((interest) => (
                  <label className="checkbox" key={interest}>
                    <input type="checkbox" />
                    <span>{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="checkboxGroup" style={{ marginTop: "2.5rem" }}>
              <h3>Kisa ou ka pataje? x What can you share?</h3>
              <div className="checkboxGrid">
                {skills.map((skill) => (
                  <label className="checkbox" key={skill}>
                    <input type="checkbox" />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="button primaryAction" style={{ width: "100%", marginTop: "2.5rem" }} type="submit">
              Submit Membership x Soumet Enskripsyon
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
