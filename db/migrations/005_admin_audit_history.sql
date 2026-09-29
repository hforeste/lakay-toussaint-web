CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor text NOT NULL,
  action text NOT NULL,
  event_id uuid,
  registration_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_log_event_created_idx
  ON admin_audit_log(event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_log_event_action_created_idx
  ON admin_audit_log(event_id, action, created_at DESC);
