# Lakay Toussaint Community Alliance Website

Public website for Lakay Toussaint Community Alliance, a Haitian-led nonprofit serving Seattle's Haitian diaspora and the broader Pacific Northwest Haitian community.

### Admin image uploads

The admin dashboard uploads event hero images directly to the configured public Vercel Blob store. Set `BLOB_READ_WRITE_TOKEN` in the admin deployment environment; keep this server-only token out of browser code and `NEXT_PUBLIC_*` variables.

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

### 4. Start the event admin application

In a second terminal, run:

```powershell
npm run dev:admin
```

Open [http://localhost:3001](http://localhost:3001) and sign in with the generated
`ADMIN_PASSWORD` stored in `.env`. The admin is a separate Next.js application under
`admin/`, but it reads the same `DATABASE_URL` as the public website.

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
npm run dev:admin    # Start the event admin on port 3001
npm run db:setup     # Apply PostgreSQL migrations and seed events
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm run build        # Create a production build
npm run build:admin  # Create an admin production build
npm run validate     # Run typecheck and build
```

## Architecture

- Next.js App Router and TypeScript
- Separate Next.js event-admin application with password-protected CRUD APIs
- PostgreSQL locally and Neon PostgreSQL in production for events and registrations
- Firebase Firestore for contact, volunteer, and business submissions
- Resend for registration email
- Kit for newsletter signup
- Vercel for deployment and scheduled registration-data cleanup

Event migrations and sample data live under `db`. Core site messaging lives in [docs/content-source.md](./docs/content-source.md).

## Production

Production requires Neon, Resend, Firebase, and the relevant public integration values from `.env.example` to be configured in Vercel. The scheduled `/api/cleanup/registeration` endpoint uses `CRON_SECRET` and removes registration data 90 days after an event ends.

Deploy the public site and event admin as separate web applications from this repository. For the
admin deployment, use `admin` as the project root and configure `DATABASE_URL`, `ADMIN_PASSWORD`,
and `PUBLIC_SITE_URL`. Give both deployments the same PostgreSQL `DATABASE_URL`; do not expose the
admin deployment's password or database connection as public environment variables.
