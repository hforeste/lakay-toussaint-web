CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  time_zone text NOT NULL DEFAULT 'America/Los_Angeles',
  location_name text NOT NULL,
  location_address text,
  summary text NOT NULL,
  description text NOT NULL,
  hero_image_url text,
  capacity integer CHECK (capacity IS NULL OR capacity > 0),
  registered_attendees integer NOT NULL DEFAULT 0 CHECK (registered_attendees >= 0),
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  max_party_size smallint NOT NULL DEFAULT 5 CHECK (max_party_size BETWEEN 1 AND 5),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  is_featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR ends_at >= starts_at),
  CHECK (registration_closes_at IS NULL OR registration_closes_at <= starts_at)
);

CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  first_name_encrypted bytea NOT NULL,
  last_name_encrypted bytea,
  email_encrypted bytea NOT NULL,
  email_lookup_hash bytea NOT NULL,
  attendee_count smallint NOT NULL CHECK (attendee_count BETWEEN 1 AND 5),
  whatsapp_phone_encrypted bytea,
  whatsapp_opt_in boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  cancellation_token_hash bytea UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz,
  CHECK (whatsapp_phone_encrypted IS NULL OR whatsapp_opt_in = true)
);

CREATE UNIQUE INDEX IF NOT EXISTS event_registrations_active_email_unique
  ON event_registrations(event_id, email_lookup_hash)
  WHERE status = 'confirmed';

CREATE INDEX IF NOT EXISTS event_registrations_event_status_idx
  ON event_registrations(event_id, status);

CREATE TABLE IF NOT EXISTS registration_rate_limits (
  scope text NOT NULL,
  key_hash bytea NOT NULL,
  window_started_at timestamptz NOT NULL,
  request_count integer NOT NULL CHECK (request_count > 0),
  PRIMARY KEY (scope, key_hash)
);
