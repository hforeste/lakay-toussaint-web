ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS date_of_birth_encrypted bytea,
  ADD COLUMN IF NOT EXISTS gender_encrypted bytea,
  ADD COLUMN IF NOT EXISTS city_encrypted bytea,
  ADD COLUMN IF NOT EXISTS county_encrypted bytea,
  ADD COLUMN IF NOT EXISTS attendance_mode text,
  ADD COLUMN IF NOT EXISTS accommodations_encrypted bytea,
  ADD COLUMN IF NOT EXISTS media_acknowledgement boolean;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'event_registrations_attendance_mode_check'
  ) THEN
    ALTER TABLE event_registrations
      ADD CONSTRAINT event_registrations_attendance_mode_check
      CHECK (attendance_mode IS NULL OR attendance_mode IN ('in-person', 'zoom'));
  END IF;
END $$;
