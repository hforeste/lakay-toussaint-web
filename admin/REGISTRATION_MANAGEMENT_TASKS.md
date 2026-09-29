# Registration Management Delivery Plan

This plan is split into two independently reviewable pull requests. Phase 2 starts only after the Phase 1 pull request has been created and validated.

## Shared constraints

- Keep the admin dashboard as a separate Next.js app using the shared PostgreSQL database.
- Require the existing authenticated admin session for every registration API and page.
- Decrypt personal data only on the server after authorization; never log plaintext PII or place it in URLs.
- Return `Cache-Control: no-store` for responses containing registration data.
- Preserve atomic capacity accounting when a registration is added, edited, or cancelled.
- Keep the LTCA color, typography, responsive layout, and accessible form/control conventions.

## Phase 1 — Registration operations

### P1-A: Registrant roster (#1)

- Add an event-scoped registration list showing name, email, phone, party size, registration date, and status.
- Include campaign-specific summary fields where relevant and keep cancelled registrations visible.
- Expose data through authenticated, event-scoped admin APIs only.

### P1-B: Registration details (#2)

- Add a focused detail panel for the selected registration.
- Show the complete submission, event information, confirmation/cancellation timestamps, and campaign-specific answers.
- Clearly distinguish registration count from total attendee count.

### P1-C: Search, filtering, and sorting (#3)

- Search by decrypted name or email without sending PII in URL query strings.
- Filter by status and attendance mode; sort by registration date, name, and party size.
- Keep controls keyboard accessible and provide useful empty states.

### P1-D: Manual registration management (#4)

- Allow an administrator to add an offline registration, correct registration details, change party size, and cancel a registration.
- Reuse server-side validation and encryption rules from the public registration flow.
- Lock the event row during mutations and update `registered_attendees` atomically without exceeding capacity.

### P1-E: CSV export (#5)

- Export the currently filtered roster from an authenticated POST endpoint.
- Provide an explicit field set, safe spreadsheet-cell escaping, and a filename tied to the event.
- Mark the download as private/no-store and never expose encryption payloads or lookup hashes.

### P1-F: Capacity overview and warnings (#6)

- Show registrations, registered attendees, capacity, spaces remaining, and percentage filled.
- Warn when an event is near capacity or a requested party-size change cannot fit.
- Keep totals consistent after create, edit, cancel, and export operations.

### Phase 1 validation gate

- Run public and admin typechecks, lint, and production builds.
- Test authenticated and unauthenticated registration endpoints.
- Validate list/detail/search/filter/sort/create/edit/cancel/export and capacity behavior against local PostgreSQL.
- Use a headed browser to validate the complete admin workflow and confirm the public site remains functional.
- Create one Phase 1 pull request before starting Phase 2.

## Phase 2 — Operations intelligence

### P2-A: Attendee communications (#9)

- Let an administrator resend an individual confirmation and compose an update for selected registration groups.
- Preview recipient count and require confirmation before sending bulk messages.
- Record provider message identifiers and delivery state when available without exposing provider secrets.

### P2-B: Audit history (#14)

- Record event changes, registration views and mutations, exports, and communication actions.
- Capture the authenticated actor, action, target, timestamp, and non-sensitive metadata.
- Add an event-scoped audit-history view with action and date filters.

### P2-C: Registration and attendance reporting (#16)

- Add event metrics for registrations, attendees, party sizes, cancellations, attendance modes, and registration growth over time.
- Provide privacy-preserving summaries and comparisons without exposing attendee PII.
- Support useful date ranges and CSV export of aggregate results.

### Phase 2 validation gate

- Run the full validation suite and database migration checks.
- Verify communications safeguards, audit coverage, and aggregate calculations with seeded data.
- Use a headed browser to exercise all Phase 2 workflows.
- Create a separate Phase 2 pull request.
