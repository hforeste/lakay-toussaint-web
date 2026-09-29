import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { parseRegistrationFilters, queryRegistrations } from "@/lib/registrations-query";

const noStore = { "Cache-Control": "private, no-store" };
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStore });
  let body: unknown = {};
  try { body = await request.json(); } catch { /* empty body uses defaults */ }
  const result = await queryRegistrations((await params).id, parseRegistrationFilters(body));
  return result ? NextResponse.json(result, { headers: noStore }) : NextResponse.json({ error: "Event not found." }, { status: 404, headers: noStore });
}
