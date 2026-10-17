import { DatabaseConfigurationError } from "@/lib/database";
import { submitSurveyResponse, SurveyRateLimitError } from "@/lib/events/surveys";

function clientIp(request: Request) {
  return request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string; surveySlug: string }> }) {
  try {
    let body: unknown;
    try { body = await request.json(); }
    catch { return Response.json({ ok: false, message: "The submission must contain valid JSON." }, { status: 400 }); }
    const payload = body && typeof body === "object" ? body as Record<string, unknown> : {};
    if (typeof payload.website === "string" && payload.website.trim()) {
      return Response.json({ ok: true, message: "Thank you for your response." }, { status: 201 });
    }
    const { slug, surveySlug } = await params;
    const result = await submitSurveyResponse({ eventSlug: slug, surveySlug, rawRespondent: payload.respondent, rawAnswers: payload.answers, ipAddress: clientIp(request) });
    if ("notFound" in result) return Response.json({ ok: false, message: "Survey not found." }, { status: 404 });
    if ("errors" in result) return Response.json({ ok: false, message: "Please correct the highlighted answers.", errors: result.errors }, { status: 422 });
    return Response.json({ ok: true, message: result.thankYouMessage }, { status: 201 });
  } catch (error) {
    if (error instanceof SurveyRateLimitError) return Response.json({ ok: false, message: "Too many submissions. Please try again in 15 minutes." }, { status: 429 });
    if (error instanceof DatabaseConfigurationError) return Response.json({ ok: false, message: "Surveys are not configured yet." }, { status: 503 });
    console.error("Survey response failed.", error);
    return Response.json({ ok: false, message: "Your response could not be saved. Please try again." }, { status: 500 });
  }
}
