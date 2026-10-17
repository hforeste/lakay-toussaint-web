import { getDatabase } from "@/lib/database";
import { encryptPersonalData, personalDataLookupHash } from "@/lib/privacy";

export type SurveyQuestionType = "short_text" | "long_text" | "email" | "single_choice" | "multiple_choice" | "rating";

export interface PublicSurveyQuestion {
  id: string;
  prompt: string;
  type: SurveyQuestionType;
  required: boolean;
  options: string[];
}

export interface PublicSurvey {
  id: string;
  slug: string;
  title: string;
  description: string;
  thankYouMessage: string;
  eventTitle: string;
  eventSlug: string;
  questions: PublicSurveyQuestion[];
}

interface SurveyRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thank_you_message: string;
  event_title: string;
  event_slug: string;
}

interface QuestionRow {
  id: string;
  prompt: string;
  question_type: SurveyQuestionType;
  is_required: boolean;
  options: unknown;
}

function options(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export async function getPublishedSurvey(eventSlug: string, surveySlug: string): Promise<PublicSurvey | null> {
  const sql = getDatabase();
  const rows = await sql<SurveyRow[]>`
    SELECT s.id, s.slug, s.title, s.description, s.thank_you_message,
      e.title AS event_title, e.slug AS event_slug
    FROM event_surveys s
    JOIN events e ON e.id = s.event_id
    WHERE e.slug = ${eventSlug} AND e.status = 'published'
      AND s.slug = ${surveySlug} AND s.status = 'published'
    LIMIT 1
  `;
  if (!rows[0]) return null;
  const questionRows = await sql<QuestionRow[]>`
    SELECT id, prompt, question_type, is_required, options
    FROM event_survey_questions
    WHERE survey_id = ${rows[0].id} AND archived_at IS NULL
    ORDER BY display_order, created_at
  `;
  return {
    id: rows[0].id,
    slug: rows[0].slug,
    title: rows[0].title,
    description: rows[0].description || "",
    thankYouMessage: rows[0].thank_you_message,
    eventTitle: rows[0].event_title,
    eventSlug: rows[0].event_slug,
    questions: questionRows.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      type: question.question_type,
      required: question.is_required,
      options: options(question.options),
    })),
  };
}

export async function getPublishedSurveyLinks(eventId: string) {
  const sql = getDatabase();
  return sql<{ slug: string; title: string; description: string | null }[]>`
    SELECT slug, title, description FROM event_surveys
    WHERE event_id = ${eventId} AND status = 'published'
    ORDER BY created_at
  `;
}

export class SurveyRateLimitError extends Error {}

interface SurveyRespondent {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

function validateRespondent(raw: unknown) {
  const input = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
  const data: SurveyRespondent = {
    firstName: text(input.firstName, 80),
    lastName: text(input.lastName, 80),
    email: text(input.email, 254).toLowerCase(),
    phone: text(input.phone, 30),
  };
  const errors: Record<string, string> = {};
  if (!data.firstName) errors.firstName = "Please enter your first name.";
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Please enter a valid email address.";
  if (data.phone && !/^\+?[0-9 ()-]{7,24}$/.test(data.phone)) errors.phone = "Please enter a valid phone number.";
  return { data, errors };
}

function validateAnswers(survey: PublicSurvey, raw: unknown) {
  const input = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const answers = new Map<string, string | number | string[]>();
  const errors: Record<string, string> = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (const question of survey.questions) {
    const value = input[question.id];
    const empty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
    if (empty) {
      if (question.required) errors[question.id] = "This question is required.";
      continue;
    }

    if (question.type === "rating") {
      const rating = Number(value);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors[question.id] = "Choose a rating from 1 to 5.";
      else answers.set(question.id, rating);
      continue;
    }
    if (question.type === "multiple_choice") {
      if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !question.options.includes(item))) {
        errors[question.id] = "Choose one or more listed options.";
      } else {
        answers.set(question.id, [...new Set(value)]);
      }
      continue;
    }
    if (typeof value !== "string") {
      errors[question.id] = "Enter a valid answer.";
      continue;
    }
    const answer = value.trim().slice(0, 2000);
    if (question.type === "single_choice" && !question.options.includes(answer)) errors[question.id] = "Choose one of the listed options.";
    else if (question.type === "email" && !emailPattern.test(answer)) errors[question.id] = "Enter a valid email address.";
    else if (!answer && question.required) errors[question.id] = "This question is required.";
    else if (answer) answers.set(question.id, answer);
  }
  return { answers, errors };
}

export async function submitSurveyResponse({
  eventSlug,
  surveySlug,
  rawRespondent,
  rawAnswers,
  ipAddress,
}: {
  eventSlug: string;
  surveySlug: string;
  rawRespondent: unknown;
  rawAnswers: unknown;
  ipAddress: string;
}) {
  const survey = await getPublishedSurvey(eventSlug, surveySlug);
  if (!survey) return { notFound: true as const };
  const respondentValidation = validateRespondent(rawRespondent);
  const validation = validateAnswers(survey, rawAnswers);
  const errors = { ...respondentValidation.errors, ...validation.errors };
  if (Object.keys(errors).length) return { errors };

  const sql = getDatabase();
  const keyHash = personalDataLookupHash(ipAddress);
  const limits = await sql<{ request_count: number }[]>`
    INSERT INTO registration_rate_limits (scope, key_hash, window_started_at, request_count)
    VALUES (${`survey-ip:${survey.id}`}, ${keyHash}, now(), 1)
    ON CONFLICT (scope, key_hash) DO UPDATE SET
      window_started_at = CASE WHEN registration_rate_limits.window_started_at < now() - interval '15 minutes' THEN now() ELSE registration_rate_limits.window_started_at END,
      request_count = CASE WHEN registration_rate_limits.window_started_at < now() - interval '15 minutes' THEN 1 ELSE registration_rate_limits.request_count + 1 END
    RETURNING request_count
  `;
  if (limits[0].request_count > 5) throw new SurveyRateLimitError();

  await sql.begin(async (tx) => {
    const respondent = respondentValidation.data;
    const responses = await tx<{ id: string }[]>`
      INSERT INTO event_survey_responses (
        survey_id, first_name_encrypted, last_name_encrypted, email_encrypted, phone_encrypted
      ) VALUES (
        ${survey.id}, ${encryptPersonalData(respondent.firstName)},
        ${respondent.lastName ? encryptPersonalData(respondent.lastName) : null},
        ${respondent.email ? encryptPersonalData(respondent.email) : null},
        ${respondent.phone ? encryptPersonalData(respondent.phone) : null}
      ) RETURNING id
    `;
    for (const [questionId, answer] of validation.answers) {
      await tx`
        INSERT INTO event_survey_answers (response_id, question_id, answer_encrypted)
        VALUES (${responses[0].id}, ${questionId}, ${encryptPersonalData(JSON.stringify(answer))})
      `;
    }
  });
  return { ok: true as const, thankYouMessage: survey.thankYouMessage };
}
