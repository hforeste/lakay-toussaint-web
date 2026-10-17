import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { deleteSurvey, parseSurveyInput, updateSurvey } from "@/lib/surveys";

const headers = { "Cache-Control": "private, no-store" };

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; surveyId: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Valid JSON is required." }, { status: 400, headers }); }
  const parsed = parseSurveyInput(body);
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 422, headers });
  const { id, surveyId } = await params;
  try {
    return await updateSurvey(id, surveyId, parsed.data)
      ? NextResponse.json({ ok: true }, { headers })
      : NextResponse.json({ error: "Survey not found." }, { status: 404, headers });
  } catch (error) {
    if (error instanceof Error && error.message.includes("event_surveys_event_id_slug_key")) return NextResponse.json({ error: "That survey URL is already in use for this event." }, { status: 409, headers });
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; surveyId: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  const { id, surveyId } = await params;
  return await deleteSurvey(id, surveyId)
    ? NextResponse.json({ ok: true }, { headers })
    : NextResponse.json({ error: "Survey not found." }, { status: 404, headers });
}
