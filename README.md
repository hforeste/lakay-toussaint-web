# Lakay Toussaint Community Alliance Website

Phase 1 public website for Lakay Toussaint Community Alliance, a Haitian-led nonprofit serving Seattle's Haitian diaspora and the broader Pacific Northwest Haitian community.

## Tech Stack

- Next.js App Router
- TypeScript
- Firebase Firestore
- Firebase Emulator Suite for local development
- Kit for newsletter signup
- Vercel-ready deployment

## Scripts

```bash
npm run dev
npm run typecheck
npm run build
npm run validate
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values that are available.

Firebase is required for live event reads and form submissions. Without Firebase configuration, the app displays seeded local events and form APIs return a clear configuration error.

Important launch values:

- `NEXT_PUBLIC_DONATION_URL`: Byrd Barr Place-approved donation route.
- `NEXT_PUBLIC_KIT_FORM_ACTION`: Kit form action URL.
- `NEXT_PUBLIC_CONTACT_EMAIL`: public LTCA contact email.

## Firebase Emulator

```bash
npx firebase-tools@13.35.1 emulators:start --only firestore,auth --project demo-lakay-toussaint
```

The MVP event model uses the `events` collection. Seed records are documented in [docs/firebase-seed-data.md](./docs/firebase-seed-data.md).

For local admin testing, create an editor account in the Auth emulator:

```bash
npm run admin:create-user
```

Default local credentials:

- Email: `editor@example.com`
- Password: `password123`

The admin UI is available at `/admin/events`.

## Content Workflow

Core messaging lives in [docs/content-source.md](./docs/content-source.md). Static MVP data lives under `data`. Public events are dynamic and should be managed through Firebase `events`, not hardcoded page data.

## Deployment

Deploy on Vercel with the same environment variables from `.env.example`. Add production Firebase values and Kit values in the Vercel project settings.

## Launch Validation

- Home identifies LTCA, the mission statement, who LTCA serves, and key actions in the first viewport.
- Events render from Firebase `events` records, with local seed records only as emulator/dev fallback.
- Donate includes the approved fiscal sponsor disclosure.
- Contact, volunteer, newsletter, and business submission forms validate inputs and show accessible success/error states.
- Business submissions write to `businessSubmissions` and do not auto-publish to the directory.
- `npm run typecheck` and `npm run build` pass before deployment.
- `npm run validate:admin` passes against Firestore + Auth emulators.
