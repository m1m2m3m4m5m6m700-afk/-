ALTER TYPE "survey_question_type" ADD VALUE IF NOT EXISTS 'dropdown';
ALTER TYPE "survey_question_type" ADD VALUE IF NOT EXISTS 'rating';
ALTER TYPE "survey_question_type" ADD VALUE IF NOT EXISTS 'nps';
ALTER TYPE "survey_question_type" ADD VALUE IF NOT EXISTS 'yes_no';
ALTER TYPE "survey_question_type" ADD VALUE IF NOT EXISTS 'textarea';
ALTER TYPE "survey_question_type" ADD VALUE IF NOT EXISTS 'number';
ALTER TYPE "survey_question_type" ADD VALUE IF NOT EXISTS 'date';
ALTER TYPE "survey_question_type" ADD VALUE IF NOT EXISTS 'email';
ALTER TYPE "survey_question_type" ADD VALUE IF NOT EXISTS 'url';
ALTER TYPE "survey_question_type" ADD VALUE IF NOT EXISTS 'ranking';
ALTER TYPE "survey_question_type" ADD VALUE IF NOT EXISTS 'matrix_single';
ALTER TYPE "survey_question_type" ADD VALUE IF NOT EXISTS 'matrix_multi';
ALTER TYPE "survey_question_type" ADD VALUE IF NOT EXISTS 'consent';

ALTER TABLE "survey_questions"
  ADD COLUMN IF NOT EXISTS "config" jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE "survey_responses"
  ALTER COLUMN "answers" SET NOT NULL;
