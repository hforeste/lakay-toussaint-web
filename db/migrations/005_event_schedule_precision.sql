ALTER TABLE events
  ADD COLUMN schedule_status text,
  ADD COLUMN event_date date;

UPDATE events
SET schedule_status = CASE WHEN starts_at IS NULL THEN 'tbd' ELSE 'scheduled' END;

ALTER TABLE events
  ALTER COLUMN schedule_status SET DEFAULT 'scheduled',
  ALTER COLUMN schedule_status SET NOT NULL,
  ADD CONSTRAINT events_schedule_status_check
    CHECK (schedule_status IN ('scheduled', 'date_only', 'tbd')),
  ADD CONSTRAINT events_schedule_shape_check
    CHECK (
      (schedule_status = 'scheduled' AND starts_at IS NOT NULL AND event_date IS NULL)
      OR (schedule_status = 'date_only' AND starts_at IS NULL AND ends_at IS NULL AND event_date IS NOT NULL)
      OR (schedule_status = 'tbd' AND starts_at IS NULL AND ends_at IS NULL AND event_date IS NULL)
    );
