import { getDatabase } from "./database";

export const AUDIT_ACTOR = "admin";

export type AuditTarget = { eventId?: string | null; registrationId?: string | null };

/** Metadata is intentionally supplied by route code as small, non-sensitive facts only. */
export async function recordAudit(action: string, target: AuditTarget = {}, metadata: Record<string, string | number | boolean | null> = {}) {
  try {
    const sql = getDatabase();
    await sql`
      INSERT INTO admin_audit_log (actor, action, event_id, registration_id, metadata)
      VALUES (${AUDIT_ACTOR}, ${action}, ${target.eventId || null}, ${target.registrationId || null}, ${sql.json(metadata)})
    `;
  } catch (error) {
    // Auditing must not turn a successful admin operation into a failed operation.
    console.error("Admin audit recording failed.", error instanceof Error ? error.message : "unknown error");
  }
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  eventId: string | null;
  registrationId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export async function listAuditHistory(eventId: string, options: { action?: string; from?: string; to?: string } = {}) {
  const sql = getDatabase();
  const action = options.action && options.action.length <= 80 ? options.action : null;
  const from = options.from && !Number.isNaN(Date.parse(options.from)) ? options.from : null;
  const to = options.to && !Number.isNaN(Date.parse(options.to)) ? options.to : null;
  const rows = await sql<{
    id: string; actor: string; action: string; event_id: string | null; registration_id: string | null;
    metadata: Record<string, unknown>; created_at: Date;
  }[]>`
    SELECT id, actor, action, event_id, registration_id, metadata, created_at
    FROM admin_audit_log
    WHERE event_id = ${eventId}
      AND (${action}::text IS NULL OR action = ${action})
      AND (${from}::timestamptz IS NULL OR created_at >= ${from}::timestamptz)
      AND (${to}::timestamptz IS NULL OR created_at < ${to}::timestamptz + interval '1 day')
    ORDER BY created_at DESC
    LIMIT 500
  `;
  return rows.map((row) => ({ id: row.id, actor: row.actor, action: row.action, eventId: row.event_id, registrationId: row.registration_id, metadata: row.metadata || {}, createdAt: row.created_at.toISOString() }));
}
