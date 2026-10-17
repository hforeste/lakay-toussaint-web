import { getDatabase } from "./database";
import { decryptPersonalData } from "./privacy";
import { slugifyEventTitle } from "./slugify";
import type postgres from "postgres";

export type SurveyStatus = "draft" | "published" | "closed";
export type SurveyQuestionType = "short_text" | "long_text" | "email" | "single_choice" | "multiple_choice" | "rating";

export interface AdminSurveyQuestion { id: string; prompt: string; type: SurveyQuestionType; required: boolean; options: string[]; }
export interface AdminSurvey { id: string; slug: string; title: string; description: string; status: SurveyStatus; thankYouMessage: string; questions: AdminSurveyQuestion[]; responseCount: number; }
export interface AdminSurveyResponse { id: string; firstName: string; lastName: string; email: string; phone: string; createdAt: string; answers: { questionId: string; prompt: string; answer: string | number | string[] }[]; }

interface SurveyRow { id: string; slug: string; title: string; description: string | null; status: SurveyStatus; thank_you_message: string; response_count: number; }
interface QuestionRow { id: string; survey_id: string; prompt: string; question_type: SurveyQuestionType; is_required: boolean; options: unknown; }

const questionTypes = new Set<SurveyQuestionType>(["short_text", "long_text", "email", "single_choice", "multiple_choice", "rating"]);
const statuses = new Set<SurveyStatus>(["draft", "published", "closed"]);
const choices = new Set<SurveyQuestionType>(["single_choice", "multiple_choice"]);
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const optionList = (value: unknown) => Array.isArray(value) ? [...new Set(value.map((item) => clean(item, 200)).filter(Boolean))].slice(0, 30) : [];

function question(row: QuestionRow): AdminSurveyQuestion {
  return { id: row.id, prompt: row.prompt, type: row.question_type, required: row.is_required, options: optionList(row.options) };
}

export async function listSurveys(eventId: string) {
  const sql = getDatabase();
  const events = await sql<{ id: string }[]>`SELECT id FROM events WHERE id = ${eventId} LIMIT 1`;
  if (!events.length) return null;
  const rows = await sql<SurveyRow[]>`
    SELECT s.id, s.slug, s.title, s.description, s.status, s.thank_you_message,
      count(r.id)::int AS response_count
    FROM event_surveys s LEFT JOIN event_survey_responses r ON r.survey_id = s.id
    WHERE s.event_id = ${eventId}
    GROUP BY s.id ORDER BY s.created_at DESC
  `;
  if (!rows.length) return [];
  const questionRows = await sql<QuestionRow[]>`
    SELECT q.id, q.survey_id, q.prompt, q.question_type, q.is_required, q.options
    FROM event_survey_questions q JOIN event_surveys s ON s.id = q.survey_id
    WHERE s.event_id = ${eventId} AND q.archived_at IS NULL
    ORDER BY q.display_order, q.created_at
  `;
  return rows.map((row): AdminSurvey => ({
    id: row.id, slug: row.slug, title: row.title, description: row.description || "", status: row.status,
    thankYouMessage: row.thank_you_message, responseCount: row.response_count,
    questions: questionRows.filter((item) => item.survey_id === row.id).map(question),
  }));
}

export interface SurveyInput { slug: string; title: string; description: string; status: SurveyStatus; thankYouMessage: string; questions: AdminSurveyQuestion[]; }

export function parseSurveyInput(value: unknown): { data?: SurveyInput; error?: string } {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const title = clean(raw.title, 200);
  const slug = slugifyEventTitle(clean(raw.slug, 200) || title);
  const status = clean(raw.status, 20) as SurveyStatus;
  const rawQuestions = Array.isArray(raw.questions) ? raw.questions : [];
  if (!title || !slug) return { error: "Survey title is required." };
  if (!statuses.has(status)) return { error: "Survey status is invalid." };
  if (!rawQuestions.length) return { error: "Add at least one survey question." };
  if (rawQuestions.length > 50) return { error: "A survey can contain up to 50 questions." };
  const questions: AdminSurveyQuestion[] = [];
  for (const [index, value] of rawQuestions.entries()) {
    const item = value && typeof value === "object" ? value as Record<string, unknown> : {};
    const prompt = clean(item.prompt, 500);
    const type = clean(item.type, 30) as SurveyQuestionType;
    const options = optionList(item.options);
    if (!prompt) return { error: `Question ${index + 1} needs a prompt.` };
    if (!questionTypes.has(type)) return { error: `Question ${index + 1} has an invalid type.` };
    if (choices.has(type) && options.length < 2) return { error: `Question ${index + 1} needs at least two choices.` };
    questions.push({ id: clean(item.id, 100), prompt, type, required: item.required === true, options: choices.has(type) ? options : [] });
  }
  return { data: { slug, title, description: clean(raw.description, 2000), status, thankYouMessage: clean(raw.thankYouMessage, 1000) || "Thank you for sharing your feedback.", questions } };
}

async function saveQuestions(tx: postgres.TransactionSql, surveyId: string, questions: AdminSurveyQuestion[]) {
  const kept: string[] = [];
  for (const [index, item] of questions.entries()) {
    if (item.id) {
      const updated = await tx<{ id: string }[]>`
        UPDATE event_survey_questions SET prompt = ${item.prompt}, question_type = ${item.type}, is_required = ${item.required},
          options = ${tx.json(item.options)}, display_order = ${index}, archived_at = NULL
        WHERE id = ${item.id} AND survey_id = ${surveyId} RETURNING id
      `;
      if (updated[0]) kept.push(updated[0].id);
    }
    if (!kept.includes(item.id)) {
      const inserted = await tx<{ id: string }[]>`
        INSERT INTO event_survey_questions (survey_id, prompt, question_type, is_required, options, display_order)
        VALUES (${surveyId}, ${item.prompt}, ${item.type}, ${item.required}, ${tx.json(item.options)}, ${index}) RETURNING id
      `;
      kept.push(inserted[0].id);
    }
  }
  await tx`UPDATE event_survey_questions SET archived_at = now() WHERE survey_id = ${surveyId} AND archived_at IS NULL AND id <> ALL(${kept})`;
}

export async function createSurvey(eventId: string, input: SurveyInput) {
  const sql = getDatabase();
  return sql.begin(async (tx) => {
    const rows = await tx<{ id: string }[]>`
      INSERT INTO event_surveys (event_id, slug, title, description, status, thank_you_message)
      SELECT id, ${input.slug}, ${input.title}, ${input.description || null}, ${input.status}, ${input.thankYouMessage}
      FROM events WHERE id = ${eventId} RETURNING id
    `;
    if (!rows[0]) return null;
    await saveQuestions(tx, rows[0].id, input.questions);
    return rows[0].id;
  });
}

export async function updateSurvey(eventId: string, surveyId: string, input: SurveyInput) {
  const sql = getDatabase();
  return sql.begin(async (tx) => {
    const rows = await tx<{ id: string }[]>`
      UPDATE event_surveys SET slug = ${input.slug}, title = ${input.title}, description = ${input.description || null},
        status = ${input.status}, thank_you_message = ${input.thankYouMessage}, updated_at = now()
      WHERE id = ${surveyId} AND event_id = ${eventId} RETURNING id
    `;
    if (!rows[0]) return false;
    await saveQuestions(tx, surveyId, input.questions);
    return true;
  });
}

export async function deleteSurvey(eventId: string, surveyId: string) {
  const sql = getDatabase();
  const rows = await sql<{ id: string }[]>`DELETE FROM event_surveys WHERE id = ${surveyId} AND event_id = ${eventId} RETURNING id`;
  return Boolean(rows[0]);
}

export async function listSurveyResponses(eventId: string, surveyId: string) {
  const sql = getDatabase();
  const rows = await sql<{ id: string; first_name_encrypted: Uint8Array; last_name_encrypted: Uint8Array | null; email_encrypted: Uint8Array | null; phone_encrypted: Uint8Array | null; created_at: Date }[]>`
    SELECT r.id, r.first_name_encrypted, r.last_name_encrypted, r.email_encrypted, r.phone_encrypted, r.created_at FROM event_survey_responses r
    JOIN event_surveys s ON s.id = r.survey_id
    WHERE r.survey_id = ${surveyId} AND s.event_id = ${eventId}
    ORDER BY r.created_at DESC
  `;
  const answers = await sql<{ response_id: string; question_id: string; prompt: string; answer_encrypted: Uint8Array }[]>`
    SELECT a.response_id, a.question_id, q.prompt, a.answer_encrypted
    FROM event_survey_answers a JOIN event_survey_questions q ON q.id = a.question_id
    JOIN event_survey_responses r ON r.id = a.response_id JOIN event_surveys s ON s.id = r.survey_id
    WHERE r.survey_id = ${surveyId} AND s.event_id = ${eventId}
  `;
  return rows.map((row): AdminSurveyResponse => ({ id: row.id, firstName: decryptPersonalData(row.first_name_encrypted), lastName: decryptPersonalData(row.last_name_encrypted), email: decryptPersonalData(row.email_encrypted), phone: decryptPersonalData(row.phone_encrypted), createdAt: row.created_at.toISOString(), answers: answers.filter((item) => item.response_id === row.id).map((item) => {
    let answer: string | number | string[] = "";
    try { answer = JSON.parse(decryptPersonalData(item.answer_encrypted)) as string | number | string[]; } catch { answer = "Unable to decrypt answer"; }
    return { questionId: item.question_id, prompt: item.prompt, answer };
  }) }));
}
