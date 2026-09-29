import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { parseRegistrationFilters, queryRegistrations, registrationsCsv } from "@/lib/registrations-query";

const noStore = { "Cache-Control": "private, no-store" };
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return new NextResponse("Unauthorized", { status: 401, headers: noStore });
  let body: unknown = {};
  try { body = await request.json(); } catch { /* empty body uses defaults */ }
  const { id } = await params;
  const result = await queryRegistrations(id, parseRegistrationFilters(body));
  if (!result) return NextResponse.json({ error: "Event not found." }, { status: 404, headers: noStore });
  const csv = registrationsCsv(result.registrations);
  const filename = `${result.event.slug || id}-registrations.csv`.replace(/[^a-zA-Z0-9._-]/g, "-");
  return new NextResponse(csv, { headers: { ...noStore, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}"` } });
}
