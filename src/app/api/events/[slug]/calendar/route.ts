import { buildKnowYourRightsIcs, type AttendanceMode } from "@/lib/events/calendar";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  if (slug !== "know-your-rights") {
    return Response.json({ ok: false, message: "Calendar event not found." }, { status: 404 });
  }
  const modeParam = new URL(request.url).searchParams.get("mode");
  const mode: AttendanceMode = modeParam === "in-person" ? "in-person" : "zoom";
  return new Response(buildKnowYourRightsIcs(mode), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="know-your-rights-2026-${mode}.ics"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
