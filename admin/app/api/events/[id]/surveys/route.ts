import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { createSurvey, listSurveys, parseSurveyInput } from "@/lib/surveys";

const headers = { "Cache-Control": "private, no-store" };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  const surveys = await listSurveys((await params).id);
  return surveys === null ? NextResponse.json({ error: "Event not found." }, { status: 404, headers }) : NextResponse.json({ surveys }, { headers });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Valid JSON is required." }, { status: 400, headers }); }
  const parsed = parseSurveyInput(body);
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 422, headers });
  try {
    const surveyId = await createSurvey((await params).id, parsed.data);
    return surveyId ? NextResponse.json({ surveyId }, { status: 201, headers }) : NextResponse.json({ error: "Event not found." }, { status: 404, headers });
  } catch (error) {
    if (error instanceof Error && error.message.includes("event_surveys_event_id_slug_key")) return NextResponse.json({ error: "That survey URL is already in use for this event." }, { status: 409, headers });
    throw error;
  }
}
