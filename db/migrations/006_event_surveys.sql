CREATE TABLE IF NOT EXISTS event_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  thank_you_message text NOT NULL DEFAULT 'Thank you for sharing your feedback.',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, slug)
);

CREATE TABLE IF NOT EXISTS event_survey_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES event_surveys(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('short_text', 'long_text', 'email', 'single_choice', 'multiple_choice', 'rating')),
  is_required boolean NOT NULL DEFAULT false,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  display_order integer NOT NULL DEFAULT 0,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_survey_questions_survey_order_idx
  ON event_survey_questions(survey_id, display_order);

CREATE TABLE IF NOT EXISTS event_survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES event_surveys(id) ON DELETE CASCADE,
  first_name_encrypted bytea NOT NULL,
  last_name_encrypted bytea,
  email_encrypted bytea,
  phone_encrypted bytea,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_survey_responses_survey_created_idx
  ON event_survey_responses(survey_id, created_at DESC);

CREATE TABLE IF NOT EXISTS event_survey_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid NOT NULL REFERENCES event_survey_responses(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES event_survey_questions(id) ON DELETE CASCADE,
  answer_encrypted bytea NOT NULL,
  UNIQUE (response_id, question_id)
);
