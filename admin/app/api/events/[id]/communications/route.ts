import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { parseCommunicationFilters, previewCommunicationRecipients, sendEventCommunication, noStore } from "@/lib/registration-communications";
import { recordAudit } from "@/lib/audit";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStore });
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return json({ error: "Unauthorized" }, 401);
  const { id } = await context.params;
  const input = await request.json().catch(() => ({})) as Record<string, unknown>;
  const filters = parseCommunicationFilters(input.filters ?? input);
  if (input.action === "preview") {
    const result = await previewCommunicationRecipients(id, filters);
    if (result && typeof result === "object" && "recipientCount" in result) await recordAudit("communication.preview", { eventId: id }, { recipientCount: Number(result.recipientCount) || 0 });
    return json(result);
  }
  if (input.action !== "send" || input.confirm !== true || typeof input.confirmedRecipientCount !== "number" || typeof input.subject !== "string" || typeof input.body !== "string") return json({ error: "A preview, exact recipient count, confirmation, subject, and message body are required." }, 400);
  const subject = input.subject.trim().slice(0, 300); const body = input.body.trim().slice(0, 10000);
  if (!subject || !body) return json({ error: "Subject and message body are required." }, 400);
  const result = await sendEventCommunication(id, subject, body, filters, input.confirmedRecipientCount);
  if (!result) return json({ error: "Event not found." }, 404);
  if ("error" in result) return json(result, result.status);
  await recordAudit("communication.send", { eventId: id }, {
    recipientCount: result.recipientCount,
    accepted: result.accepted,
    skipped: result.skipped,
    failed: result.failed,
  });
  return json(result);
}
