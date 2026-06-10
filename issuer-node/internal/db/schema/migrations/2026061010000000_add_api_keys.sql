-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS api_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_name text NOT NULL CHECK (btrim(partner_name) <> ''),
    key_prefix text NOT NULL UNIQUE CHECK (btrim(key_prefix) <> ''),
    key_hash bytea NOT NULL UNIQUE,
    scopes text[] NOT NULL DEFAULT '{}',
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    created_at timestamptz NOT NULL DEFAULT now(),
    last_used_at timestamptz,
    expires_at timestamptz,
    revoked_at timestamptz,
    revoked_reason text
);

CREATE INDEX IF NOT EXISTS api_keys_key_prefix_idx ON api_keys (key_prefix);
CREATE INDEX IF NOT EXISTS api_keys_status_idx ON api_keys (status);

CREATE TABLE IF NOT EXISTS api_key_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id uuid NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    event_type text NOT NULL CHECK (btrim(event_type) <> ''),
    ip_address inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now(),
    metadata jsonb NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS api_key_events_api_key_id_created_at_idx
    ON api_key_events (api_key_id, created_at DESC);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS api_key_events_api_key_id_created_at_idx;
DROP TABLE IF EXISTS api_key_events;
DROP INDEX IF EXISTS api_keys_status_idx;
DROP INDEX IF EXISTS api_keys_key_prefix_idx;
DROP TABLE IF EXISTS api_keys;
-- +goose StatementEnd
