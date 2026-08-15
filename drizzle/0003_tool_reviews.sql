CREATE TABLE IF NOT EXISTS "tool_reviews" (
  "slug" text PRIMARY KEY NOT NULL,
  "reviewed" boolean DEFAULT false NOT NULL,
  "reviewed_at" timestamp with time zone,
  "reviewed_by" text,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "tool_reviews_reviewed_idx" ON "tool_reviews" ("reviewed");
