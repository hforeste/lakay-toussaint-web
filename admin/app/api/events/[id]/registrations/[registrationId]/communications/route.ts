import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { noStore, resendRegistrationConfirmation } from "@/lib/registration-communications";
import { recordAudit } from "@/lib/audit";

export async function POST(_request: Request, context: { params: Promise<{ id: string; registrationId: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStore });
  const { id, registrationId } = await context.params;
  const result = await resendRegistrationConfirmation(id, registrationId);
  if (!result) return NextResponse.json({ error: "Registration not found." }, { status: 404, headers: noStore });
  if ("error" in result) return NextResponse.json(result, { status: result.status, headers: noStore });
  await recordAudit("communication.resend_confirmation", { eventId: id, registrationId }, {
    accepted: result.accepted,
    skipped: result.skipped,
    failed: result.failed,
  });
  return NextResponse.json(result, { headers: noStore });
}
