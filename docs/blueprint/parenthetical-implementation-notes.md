# Parenthetical Implementation Notes

These notes translate blueprint parentheticals into concrete implementation guidance. Parenthetical text is implementation guidance by default, not public copy, unless it contains exact quoted language intended for display.

## Navigation

### `(matching the HCX structure)`

HCX navigation was inspected with `playwright-cli` in headed mode on 2026-07-27 at `https://haiticulturalx.org/` using desktop (`1440x900`) and mobile (`390x844`) viewports. Use these findings as the technical reference; do not require every future implementation task to re-inspect HCX unless the reference site has materially changed.

Observed HCX desktop pattern:

- Header uses two tiers: a utility/social tier above the main navigation, then a main tier with logo at left and horizontal primary navigation at right.
- Utility tier includes social links plus action links such as Archives, Newsletter, and Support Us.
- Main nav order observed: Events, Programs, News, About, Join Us, Resources, Contact, plus search.
- About, Join Us, and Resources are dropdown-style grouped nav items.
- Programs has deeper grouping/megamenu behavior on HCX, but Lakay Toussaint should keep Programs simpler unless the content volume requires a megamenu.
- Search is a compact icon action rather than a text nav item.

Observed HCX mobile pattern:

- Header keeps the utility/social tier visible above the logo row.
- Logo appears on the left; search and a menu trigger appear on the right.
- The mobile menu opens as a vertical flyout list of top-level nav items.
- Nested items exist in the menu structure, but the first visible mobile layer emphasizes the top-level sections rather than exposing every child at once.

Technical direction for Lakay Toussaint:

- Build a two-tier header only if it remains clean on mobile: social/newsletter/donate utility actions may live above the logo/nav row, but Donate must remain present and secondary rather than visually dominant.
- Desktop should use a horizontal primary nav with grouped dropdowns for About, Join Us, and Resources.
- Mobile should use a logo row with compact search/menu controls and a vertical menu, not a squeezed desktop nav.
- Mobile menu should show top-level items first, with child links revealed by expansion or nested grouping.
- Preserve Lakay Toussaint branding, colors, typography, and content hierarchy from `DESIGN.md`; HCX is a structure reference, not a visual clone.

## Placeholder Sections

### `(build when board bios are ready)`

Build the Leadership and Board page now, even before bios are ready.

Technically, this means:

- Create the page/route and include five unnamed person placeholders.
- Each placeholder should reserve space for a future photo, role/title, name, and description.
- Do not invent names, roles, credentials, biographies, or photos.
- Use coming-soon language around the section so visitors understand the page is intentionally in progress.
- The page should feel like a designed future-state layout, not an empty page.

### `(Name funders and add a “special thanks” line for officials/leaders as support grows.)`

Build the supporters section/page with designed placeholders now.

Technically, this means:

- Include placeholder slots for future funders/supporters and a special-thanks area.
- Do not invent funder names, official names, logos, or endorsements.
- Use coming-soon copy to explain that supporter information will be added as relationships are confirmed.
- Preserve the layout so future real names/logos can replace placeholders without redesigning the page.

## Buttons And Action Hierarchy

### `(warm accent, present but never dominant)`

The Donate button should be visible, warm, and easy to find, but it must not become the primary emotional or visual driver of the site.

Technically, this means:

- Use the brand accent palette from `DESIGN.md`, especially red `#CD1223` or a restrained gold accent `#EFC577`, with accessible contrast.
- In the global header, Donate may be a button or highlighted nav item, but it should be visually smaller or equal in weight to the main participation CTA when both appear together.
- Avoid oversized donation banners, sticky donation overlays, pulsing animations, modal prompts, or repeated donation CTAs above the fold on non-Donate pages.
- On content pages, place donation modules after the page's cultural, historical, programmatic, or informational content.
- Preserve visibility through consistent placement in navigation/footer, not through visual pressure.

### `(primary)`

Primary CTAs represent the main user action for the current section.

Technically, this means:

- Use the strongest button treatment from `DESIGN.md`: saturated red or navy background with white text.
- Use only one primary CTA per section or decision area.
- Prefer invitation/action labels such as `See what’s happening`, `Vin manm × Become a member`, or other blueprint-approved CTAs.
- Primary buttons should have the strongest visual weight among sibling actions but must still fit the page hierarchy.

### `(secondary)`

Secondary CTAs support the primary action without competing with it.

Technically, this means:

- Use a quieter treatment: white or light gray background, navy text, and navy or gold border.
- Place secondary CTAs beside or below the primary CTA with lower visual weight.
- Do not use the same filled red/navy style as the primary CTA in the same section.
- Keep labels short and action-oriented.

## Donation Posture

### `(pride, not pity — placed low on the page)`

Donation language should communicate a proud, independent, culturally rich community inviting investment in shared work. It must not frame the community as helpless, dependent, or defined by need.

Technically, this means:

- Do not lead public pages with donation asks unless the page is the Donate page.
- On the homepage and other non-Donate pages, place donation sections after welcome, events/program information, cultural story, or other primary content.
- Use language of power, history, culture, mutual care, home, and community building.
- Avoid pity-oriented patterns: crisis-first headlines, hardship imagery, guilt language, savior framing, “help these people” framing, or donation popups.
- Keep Donate visible through navigation/footer and contextually relevant sections, but let membership, events, programs, culture, and history take front stage.
- Use joyful, dignified imagery if a donation section has imagery; never use hardship imagery to drive gifts.

### `(donation centerpiece)`

The Family Emergency Fund should be visually prominent on the Programs page and may have a donation-oriented CTA, while still following the dignity-first donation posture above.

Technically, this means:

- Treat the fund as a major Programs page section, not a small footnote.
- Keep the copy neighbor-to-neighbor and dignity-centered.
- Include the donation/fund CTA, but do not let it override the Programs page's broader program structure.
## Photography Source

All public website photography must come from the approved 2025 picnic Dropbox collection recorded in `docs/blueprint/implementation-decisions.md`, unless the user explicitly approves another source later.

Technically, this means:

- When a page needs a real photo, select from the approved picnic collection first.
- Do not use stock photos, generated photos, unrelated web images, or unapproved community photos.
- Keep selections joy-forward and dignity-first: dancing, food, family, gathering, community, and Haitian flag imagery.
- If the approved collection does not contain a suitable photo for a section, use a designed non-photographic placeholder rather than sourcing elsewhere.

