CREATE TABLE IF NOT EXISTS event_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  subject text NOT NULL,
  body_html text NOT NULL,
  filter_status text NOT NULL DEFAULT 'confirmed' CHECK (filter_status IN ('confirmed', 'cancelled', 'all')),
  filter_attendance_mode text CHECK (filter_attendance_mode IS NULL OR filter_attendance_mode IN ('in-person', 'zoom')),
  recipient_count integer NOT NULL CHECK (recipient_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_communication_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  communication_id uuid NOT NULL REFERENCES event_communications(id) ON DELETE CASCADE,
  registration_id uuid NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
  provider_message_id text,
  state text NOT NULL CHECK (state IN ('accepted', 'skipped', 'failed')),
  failure_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (communication_id, registration_id)
);

CREATE INDEX IF NOT EXISTS event_communications_event_idx ON event_communications(event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS event_communication_deliveries_communication_idx ON event_communication_deliveries(communication_id);
