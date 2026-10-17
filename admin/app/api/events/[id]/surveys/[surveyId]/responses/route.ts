import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { listSurveyResponses } from "@/lib/surveys";

const headers = { "Cache-Control": "private, no-store" };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; surveyId: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  const { id, surveyId } = await params;
  return NextResponse.json({ responses: await listSurveyResponses(id, surveyId) }, { headers });
}
