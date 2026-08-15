-- Owner/admin bootstrap account.
-- Exactly one row is allowed via the unique singleton key; the first
-- registration becomes the permanent owner account.

CREATE TABLE IF NOT EXISTS admin_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_key text NOT NULL UNIQUE DEFAULT 'owner',
  name text NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL,
  session_secret text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_accounts_email_idx ON admin_accounts(lower(email));
