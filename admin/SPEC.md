# Event Admin Dashboard Specification

## Application boundary

- The dashboard is a standalone Next.js application served locally at `http://localhost:3001`.
- It connects directly to the same PostgreSQL database as the public application through `DATABASE_URL`.
- All dashboard pages and event APIs require an authenticated admin session.

## Authentication

- Unauthenticated visitors are redirected to `/login`.
- A valid `ADMIN_PASSWORD` creates an HTTP-only, same-site session cookie.
- Invalid credentials show a clear error without exposing configuration values.
- Signing out invalidates the session and returns the user to the login page.

## Event management

- The dashboard lists all events, including draft, published, cancelled, and completed events.
- An admin can create, inspect, edit, publish/unpublish, and delete an event.
- The editor supports title, slug, subtitle, summary, description, start/end times, timezone,
  location, address, hero image URL, capacity, registration window, maximum party size,
  status, featured state, and display order.
- Required fields and date/capacity constraints are validated server-side.
- Destructive deletion requires explicit confirmation.
- Successful mutations provide visible feedback and refresh the event list.

## Public-site propagation

- Published events appear on the public `/events` page and their detail route.
- Draft, cancelled, and completed events do not appear in the public event listing.
- Updates to a published event are visible on its public detail route without a rebuild.
- Deleting an event removes it from the public application.

## UX and accessibility

- The interface follows the LTCA navy, red, gold, green, light-gray, League Spartan, and Garet design system.
- Forms have explicit labels, keyboard-accessible controls, visible focus, and useful error/status messaging.
- The dashboard works without horizontal overflow at desktop and mobile viewport widths.
- Loading and submission states prevent duplicate actions.
