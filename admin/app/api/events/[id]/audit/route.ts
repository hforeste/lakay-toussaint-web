import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { listAuditHistory } from "@/lib/audit";

const noStore = { "Cache-Control": "private, no-store" };

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStore });
  let body: unknown = {};
  try { body = await request.json(); } catch { /* defaults */ }
  const raw = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const { id } = await params;
  const entries = await listAuditHistory(id, {
    action: typeof raw.action === "string" ? raw.action.trim() : undefined,
    from: typeof raw.from === "string" ? raw.from : undefined,
    to: typeof raw.to === "string" ? raw.to : undefined,
  });
  return NextResponse.json({ entries }, { headers: noStore });
}
