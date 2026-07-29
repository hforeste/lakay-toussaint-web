# Blueprint Implementation Decisions

These decisions clarify how the Lakay Toussaint website blueprint should be implemented.

## Coming Soon Content

For sections where final information is not ready, publish warm coming-soon copy rather than empty placeholders.

Recommended copy:

> More information is coming soon. Lakay Toussaint is building this part of the home with care, and we will share updates here as details are confirmed.

Use this treatment for:

- Leadership and Board, until board bios are ready.
- Our Supporters, until funders or special thanks are confirmed.
- Named partners and partner logos, until relationships are confirmed.
- Contact details, office hours, and drop-in hours, until approved for publication.
- Rebati Ayiti, which should appear publicly as coming soon.

## Forms And Storage

The website should collect and store information for:

- Membership
- Contact
- Volunteer interest
- Partnership interest
- Immigration help and program intake requests

The future data store may be PostgreSQL or Firestore. Until that decision is made, implementation should keep form handling behind a storage abstraction so either backend can be adopted without rewriting page-level form UX.

## Donations And Stripe

People should be able to donate directly on the website. The Donate button and donation page should communicate that online giving is coming soon and will be powered through Stripe.

Use the blueprint's exact donation wording:

> Your gift powers Kreyòl-language immigration navigation, youth leadership, career pathways, four community celebrations a year, and the Family Emergency Fund that ensures no family in our lakay faces a hard moment alone. Lakay Toussaint is fiscally sponsored by Byrd Barr Place; donations are tax-deductible to the extent allowed by law.

GitHub issue for Stripe implementation: https://github.com/hforeste/lakay-toussaint-web/issues/15.

## Compliance Language

Use the exact immigration disclaimer language from the blueprint:

> Lakay Toussaint is not a law firm and does not provide legal advice; we connect community members with qualified legal service providers.

Use the blueprint's exact donation and fiscal sponsorship wording anywhere donation functionality appears.

## Events

Event pages and cards may use evergreen annual language when dates and venues are not confirmed. "Evergreen" means wording that remains accurate over time, such as "every May 18" or "every Labor Day," instead of a specific date, venue, or schedule that may change.

When a date, venue, schedule, photos, volunteer signup, or sponsor info is confirmed, event detail pages should be updated with the confirmed information.

## Privacy

Use both inline privacy language and a formal Privacy page.

Inline privacy promise:

> We will never ask your immigration status, and we never share your information with anyone. Ever. Nou p ap janm mande estati imigrasyon ou, e nou p ap janm pataje enfòmasyon ou ak pèsonn. Jamè.

The Privacy page should explain, in plain language:

- What information the website collects.
- Why Lakay Toussaint collects it.
- Where information is stored.
- Who can access it.
- That immigration status is never requested.
- That information is not shared outside Lakay Toussaint except as required to provide requested support, comply with law, or with explicit consent.

## Language Pattern

Kreyòl should lead in headings and calls to action. Body copy should be mostly English for v1.

Examples:

- MISYON NOU × OUR MISSION
- PWOGRAM NOU YO × OUR PROGRAMS
- Vin manm × Become a member
- Fè yon don × Make a donation

## Parenthetical Implementation Notes

Detailed translations of blueprint parentheticals live in docs/blueprint/parenthetical-implementation-notes.md. Follow that file when implementing navigation, placeholders, CTA hierarchy, donation posture, and other parenthetical guidance.
## Photography And Media Source

All public website photography must be sourced from the approved 2025 picnic photo collection unless the user explicitly approves another source in a later task.

Approved source collection:

https://www.dropbox.com/scl/fo/jfu11302aukm7xk67qtmj/APhvMFJ1QgZiUM7kQUOiQMU?rlkey=slu4z89nh0ks6rp9sm7bl9yq5&st=cpv91wkz&dl=0

Implementation rules:

- Use photos from this collection for hero images, event imagery, news/event recap imagery, and other public site photography.
- Do not use stock photography, generated photography, unrelated web images, or photos from unapproved sources.
- Continue to follow the blueprint's imagery direction: joy, dancing, food, family, community, and the Haitian flag; never hardship imagery.
- Do not invent partner logos, leader photos, names, endorsements, or documentary photos from Haiti.
- Use designed placeholders where approved real photos are not yet available.


