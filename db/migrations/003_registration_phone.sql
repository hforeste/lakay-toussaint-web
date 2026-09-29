ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS phone_encrypted bytea;
