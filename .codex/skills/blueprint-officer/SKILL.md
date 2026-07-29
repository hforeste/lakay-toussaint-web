---
name: blueprint-officer
description: Verify Lakay Toussaint Community Alliance website work against the local blueprint/spec. Use when Codex changes or reviews UI, copy, navigation, forms, donations, programs, events, resources, privacy, imagery, page structure, or any content under src/app, src/components, data, public/images, docs/blueprint, or related site metadata.
---

# Blueprint Officer

## Overview

Use this skill as the blueprint/spec verifier for Lakay Toussaint website work. The goal is to catch drift from the approved website blueprint before work is handed back.

## Required Sources

Before reviewing, read the local source files that apply:

- `docs/blueprint/lakay-toussaint-website-blueprint.md` for the full blueprint/spec.
- `docs/blueprint/implementation-decisions.md` for project decisions that clarify the blueprint.
- `docs/blueprint/parenthetical-implementation-notes.md` when reviewing implementation guidance, placeholders, CTA hierarchy, navigation, or donation posture.

If the user provides a newer explicit instruction, follow it and note that it supersedes the local blueprint for that task.

## Review Workflow

1. Identify whether the change touches blueprint-relevant work: UI, copy, navigation, forms, donations, programs, events, resources, privacy, imagery, or site metadata.
2. Review the changed behavior and visible copy against the required sources.
3. Separate objective failures from judgment notes.
4. Return one concise result:
   - `Blueprint Officer check: Pass`
   - `Blueprint Officer check: Pass with notes: ...`
   - `Blueprint Officer check: Needs revision: ...`

Use `Needs revision` when required legal/donation/privacy language is missing, page structure contradicts the blueprint, or unready content is presented as confirmed.

## Compliance Checklist

- Kreyòl leads headings and CTAs; body copy is mostly English for v1.
- Tone is dignity-first, culture-forward, and never charity-toned.
- Homepage order follows the blueprint: welcome, inform, celebrate, teach, then ask.
- Navigation aligns with the blueprint: Events, Programs, News, About, Join Us, Resources, Contact, Donate.
- Donate is persistent but secondary outside the Donate page.
- Donation copy uses the blueprint's exact wording.
- Stripe donation functionality is communicated as coming soon until implemented.
- Immigration support includes the exact legal disclaimer.
- Footer and donation areas include fiscal sponsorship and tax-deductibility wording from the blueprint.
- Forms collect and store information, with storage adaptable for PostgreSQL or Firestore.
- Membership and intake flows do not ask immigration status.
- Privacy promise appears inline, and a formal Privacy page exists or is planned when privacy-affecting work is implemented.
- Rebati Ayiti appears as coming soon until the Haiti partnership and Byrd Barr approval are confirmed.
- Unready content uses warm coming-soon copy rather than empty placeholders.
- Events may use evergreen annual language until exact dates and venues are confirmed.
- Imagery uses the approved 2025 picnic photo collection unless the user explicitly approves another source; selections emphasize joy, food, family, music, culture, and the Haitian flag, never hardship.
- Program numbers remain consistent: 60 families, 50 students, 60 workers, and $50,000 fund.

## Exact Required Language

Immigration disclaimer:

> Lakay Toussaint is not a law firm and does not provide legal advice; we connect community members with qualified legal service providers.

Donation/fiscal sponsorship language:

> Your gift powers Kreyòl-language immigration navigation, youth leadership, career pathways, four community celebrations a year, and the Family Emergency Fund that ensures no family in our lakay faces a hard moment alone. Lakay Toussaint is fiscally sponsored by Byrd Barr Place; donations are tax-deductible to the extent allowed by law.

Default coming-soon copy:

> More information is coming soon. Lakay Toussaint is building this part of the home with care, and we will share updates here as details are confirmed.

Inline privacy promise:

> We will never ask your immigration status, and we never share your information with anyone. Ever. Nou p ap janm mande estati imigrasyon ou, e nou p ap janm pataje enfòmasyon ou ak pèsonn. Jamè.




