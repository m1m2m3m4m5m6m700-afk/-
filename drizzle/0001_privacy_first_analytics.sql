-- Privacy-first first-party analytics and survey tables.
-- No IP address, full referrer URL, raw search query, user agent, or persistent
-- cross-site identifier is stored by this layer.

ALTER TYPE analytics_event_type ADD VALUE IF NOT EXISTS 'session_start';
ALTER TYPE analytics_event_type ADD VALUE IF NOT EXISTS 'session_end';
ALTER TYPE analytics_event_type ADD VALUE IF NOT EXISTS 'tool_start';
ALTER TYPE analytics_event_type ADD VALUE IF NOT EXISTS 'tool_complete';
ALTER TYPE analytics_event_type ADD VALUE IF NOT EXISTS 'navigation';
ALTER TYPE analytics_event_type ADD VALUE IF NOT EXISTS 'survey_response';

ALTER TABLE analytics_events
  ADD COLUMN IF NOT EXISTS session_id text,
  ADD COLUMN IF NOT EXISTS locale text,
  ADD COLUMN IF NOT EXISTS intent_id text,
  ADD COLUMN IF NOT EXISTS query_hash text,
  ADD COLUMN IF NOT EXISTS referrer_origin text,
  ADD COLUMN IF NOT EXISTS previous_path text,
  ADD COLUMN IF NOT EXISTS duration_ms integer;

CREATE TYPE survey_question_type AS ENUM ('single_choice', 'multi_choice', 'scale', 'text');

CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  active boolean NOT NULL DEFAULT false,
  target_locale text,
  max_responses integer,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS survey_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  type survey_question_type NOT NULL,
  prompt text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  required boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  session_id text,
  locale text,
  answers jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS analytics_events_session_id_idx ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS analytics_events_tool_id_idx ON analytics_events(tool_id);
CREATE INDEX IF NOT EXISTS analytics_events_intent_id_idx ON analytics_events(intent_id);
CREATE INDEX IF NOT EXISTS survey_responses_survey_id_idx ON survey_responses(survey_id);
