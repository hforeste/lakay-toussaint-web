import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getRegistrationReport, parseReportRange, registrationReportCsv } from "@/lib/registration-reports";

const noStore = { "Cache-Control": "private, no-store" };

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStore });
  let body: unknown = {};
  try { body = await request.json(); } catch { /* defaults */ }
  const parsed = parseReportRange(body);
  if (!parsed.range) return NextResponse.json({ error: parsed.error }, { status: 400, headers: noStore });
  const report = await getRegistrationReport((await params).id, parsed.range);
  if (!report) return NextResponse.json({ error: "Event not found." }, { status: 404, headers: noStore });
  const format = body && typeof body === "object" && (body as Record<string, unknown>).format === "csv" ? "csv" : "json";
  if (format === "csv") {
    return new Response(registrationReportCsv(report), {
      headers: { ...noStore, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=registration-report.csv" },
    });
  }
  return NextResponse.json(report, { headers: noStore });
}
