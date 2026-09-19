# Lakay Toussaint Community Alliance Website

Phase 1 public website for Lakay Toussaint Community Alliance, a Haitian-led nonprofit serving Seattle's Haitian diaspora and the broader Pacific Northwest Haitian community.

## Tech Stack

- Next.js App Router
- TypeScript
- Neon PostgreSQL for events and registrations
- Firebase Firestore for public contact, volunteer, and business submissions
- Firebase Emulator Suite for local development
- Resend for registration email
- Kit for newsletter signup
- Vercel-ready deployment

## Scripts

```bash
npm run dev
npm run typecheck
npm run build
npm run validate
npm run db:setup
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values that are available.

PostgreSQL is required for event pages and event registration. Firebase remains responsible for the existing public submission forms.

Important launch values:

- `NEXT_PUBLIC_DONATION_URL`: Byrd Barr Place-approved donation route.
- `NEXT_PUBLIC_KIT_FORM_ACTION`: Kit form action URL.
- `NEXT_PUBLIC_CONTACT_EMAIL`: public LTCA contact email.
- `DATABASE_URL`: pooled Neon connection string in production or the Docker connection string locally.
- `PII_ENCRYPTION_KEY`: base64-encoded 32-byte key used to encrypt registration PII.
- `PII_LOOKUP_KEY`: random secret of at least 32 characters used for keyed lookup hashes.
- `RESEND_API_KEY` and `REGISTRATION_EMAIL_FROM`: confirmation-email configuration.
- `APP_URL`: canonical site origin used in cancellation links.
- `CRON_SECRET`: protects the 90-day cleanup endpoint.

Generate local secrets with Node:

```bash
node -e "const c=require('node:crypto'); console.log(c.randomBytes(32).toString('base64'))"
node -e "const c=require('node:crypto'); console.log(c.randomBytes(32).toString('hex'))"
```

## Local PostgreSQL

Start PostgreSQL, apply migrations, and load the sample events:

```bash
docker compose up -d postgres
npm run db:setup
```

The default local connection string is already shown in `.env.example`. Production should use a pooled Neon connection string with TLS.

## Firebase Emulator

```bash
npx firebase-tools@13.35.1 emulators:start --only firestore --project demo-lakay-toussaint
```

## Content Workflow

Core messaging lives in [docs/content-source.md](./docs/content-source.md). Public events and registrations live in PostgreSQL. Database migrations and sample event data live under `db`.

## Deployment

Deploy on Vercel with the same environment variables from `.env.example`. Add production Neon, Resend, Firebase, and Kit values in the Vercel project settings. Vercel invokes `/api/cleanup/registeration` daily to delete registration PII 90 days after an event ends.

## Launch Validation

- Home identifies LTCA, the mission statement, who LTCA serves, and key actions in the first viewport.
- Events render from PostgreSQL records and link to detailed registration pages.
- Registration PII is application-encrypted, party size is limited to five, and cancellation links are tokenized.
- Donate includes the approved fiscal sponsor disclosure.
- Contact, volunteer, newsletter, and business submission forms validate inputs and show accessible success/error states.
- Business submissions write to `businessSubmissions` and do not auto-publish to the directory.
- `npm run typecheck` and `npm run build` pass before deployment.
