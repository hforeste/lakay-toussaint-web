# Lakay Toussaint Community Alliance Website

Public website for Lakay Toussaint Community Alliance, a Haitian-led nonprofit serving Seattle's Haitian diaspora and the broader Pacific Northwest Haitian community.

## Local development

### Prerequisites

- Node.js 22 LTS
- npm
- Docker Desktop

### 1. Install dependencies

```powershell
npm install
```

### 2. Start and initialize PostgreSQL

Start Docker Desktop, then run:

```powershell
docker compose up -d postgres
npm run db:setup
```

`db:setup` creates `.env` from `.env.example` if necessary, generates the required local privacy keys, applies database migrations, and loads the sample events. It can be run again safely and does not replace existing keys. Keep `.env` and `.env.local` out of source control; when both exist, `.env.local` takes precedence.

### 3. Start the application

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For later runs, the usual startup commands are simply:

```powershell
docker compose up -d postgres
npm run dev
```

## Optional local integrations

Registration emails are skipped in development unless `RESEND_API_KEY` and `REGISTRATION_EMAIL_FROM` are configured.

Contact, volunteer, and business-directory submissions still use Firebase Firestore. To exercise those forms locally, configure the `NEXT_PUBLIC_FIREBASE_*` variables in `.env`, set `NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true`, and start the emulator in another terminal:

```powershell
npm run emulators
```

Newsletter, donation, contact, and community-video settings are also optional for basic local startup. Their variables are documented in `.env.example`.

## Useful commands

```powershell
npm run dev          # Start the Next.js development server
npm run db:setup     # Apply PostgreSQL migrations and seed events
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm run build        # Create a production build
npm run validate     # Run typecheck and build
```

## Architecture

- Next.js App Router and TypeScript
- PostgreSQL locally and Neon PostgreSQL in production for events and registrations
- Firebase Firestore for contact, volunteer, and business submissions
- Resend for registration email
- Kit for newsletter signup
- Vercel for deployment and scheduled registration-data cleanup

Event migrations and sample data live under `db`. Core site messaging lives in [docs/content-source.md](./docs/content-source.md).

## Production

Production requires Neon, Resend, Firebase, and the relevant public integration values from `.env.example` to be configured in Vercel. The scheduled `/api/cleanup/registeration` endpoint uses `CRON_SECRET` and removes registration data 90 days after an event ends.
