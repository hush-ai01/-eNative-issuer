# API Key Management Plan

## Purpose

Add API key management for B2B KYC partners without weakening the existing issuer-node basic-auth model. This is the access-control layer for the future B2B KYC API wrapper.

This plan assumes the eNumber mapping schema from the Supabase integration:

- eNumber column: `public.enumbers.e_number`
- DID column: `public.enumbers.did`

## Goals

- Let an administrator create, list, rotate, revoke, and audit partner API keys.
- Authenticate B2B KYC API requests with scoped API keys.
- Store only key hashes, never plaintext API keys.
- Keep authentication constant-time where practical.
- Make key usage auditable without logging secrets.
- Keep the first implementation narrow enough for a high-quality PR.

## Non-Goals

- Do not replace issuer-node basic auth for existing issuer APIs.
- Do not build the full B2B KYC API wrapper in the same PR.
- Do not add a partner dashboard yet.
- Do not store raw API keys, even encrypted.

## Proposed Data Model

Add an issuer-node migration for `api_keys`.

```sql
create table api_keys (
  id uuid primary key default gen_random_uuid(),
  partner_name text not null,
  key_prefix text not null unique,
  key_hash bytea not null unique,
  scopes text[] not null default '{}',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_reason text,
  constraint api_keys_partner_name_not_blank check (length(trim(partner_name)) > 0),
  constraint api_keys_status_valid check (status in ('active', 'revoked'))
);
```

Add `api_key_events` for auditability.

```sql
create table api_key_events (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid not null references api_keys(id),
  event_type text not null,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'
);
```

Recommended indexes:

- `api_keys(key_prefix)`
- `api_keys(status)`
- `api_key_events(api_key_id, created_at desc)`

## Key Format

Use a generated key format with a stable public prefix:

```text
enat_live_<key-id-prefix>_<secret>
```

Rules:

- Prefix is safe to log: first 16-24 visible chars only.
- Secret is at least 32 random bytes, base64url encoded.
- Store `key_hash = HMAC-SHA256(server_pepper, full_api_key)`.
- `server_pepper` must come from an environment variable, for example `ISSUER_API_KEY_PEPPER`.
- Return the full API key only once on creation.

Reasoning: a keyed HMAC hash protects stored keys better than a plain SHA hash if the database is leaked.

## Scopes

Start with narrow scopes:

- `kyc:read`
- `kyc:verify`
- `enumber:read`
- `credential:issue`

The first B2B KYC endpoint should require the smallest possible scope, for example `kyc:verify`.

## API Design

Admin endpoints remain protected by existing issuer-node basic auth:

- `POST /v2/api-keys`
- `GET /v2/api-keys`
- `GET /v2/api-keys/{id}`
- `POST /v2/api-keys/{id}/rotate`
- `POST /v2/api-keys/{id}/revoke`

Partner-facing endpoints use API key auth:

- Header: `Authorization: Bearer <api-key>`
- Alternative for internal tools only: `X-API-Key: <api-key>`

Middleware behavior:

1. Extract key from `Authorization: Bearer`.
2. Reject missing or malformed keys with `401`.
3. Find candidate row by `key_prefix`.
4. HMAC the presented key and compare with `subtle.ConstantTimeCompare`.
5. Reject revoked or expired keys with `401`.
6. Check required scope and reject insufficient scope with `403`.
7. Attach partner/key metadata to request context.
8. Update `last_used_at` asynchronously or in a low-impact best-effort path.
9. Write audit event without logging the API key.

## Implementation Steps

1. Add database migrations under `issuer-node/internal/db/schema/migrations`.
2. Add domain types under `issuer-node/internal/core/domain`.
3. Add repository interface under `issuer-node/internal/core/ports`.
4. Add Postgres repository under `issuer-node/internal/repositories`.
5. Add service under `issuer-node/internal/core/services`.
6. Add API spec entries to `issuer-node/api/api.yaml`.
7. Regenerate `issuer-node/internal/api/api.gen.go` with `make api`.
8. Add API handlers under `issuer-node/internal/api`.
9. Add API key auth middleware for partner-facing endpoints.
10. Add tests at repository, service, middleware, and API levels.

## Code Quality Requirements

- Do not expose plaintext API keys in logs, errors, responses, or tests after creation.
- Do not use ad hoc string parsing where typed request structs are available.
- Keep API key auth separate from existing basic auth middleware.
- Use dependency injection for the API key service so tests can mock behavior.
- Keep first PR focused on key management only; B2B KYC endpoints can follow.
- Regenerate OpenAPI code instead of editing generated files manually.

## Security Review Checklist

- API keys are generated with cryptographic randomness.
- Full key is returned only once.
- Database stores HMAC hash, not plaintext.
- HMAC pepper is required in non-local environments.
- Key comparison is constant-time.
- Revoked and expired keys fail closed.
- Scope checks are explicit per endpoint.
- Audit events exclude secret material.
- Error responses do not reveal whether a prefix exists.
- Tests cover missing, malformed, revoked, expired, wrong-scope, and valid keys.

## Test Plan

Repository tests:

- create key metadata
- fetch by prefix
- revoke key
- record audit event
- update `last_used_at`

Service tests:

- key generation shape
- hash verification
- one-time plaintext return
- rotation revokes old key and returns new key
- expiry handling

Middleware tests:

- missing key returns `401`
- malformed key returns `401`
- invalid key returns `401`
- revoked key returns `401`
- expired key returns `401`
- valid key with missing scope returns `403`
- valid key with required scope reaches handler

API tests:

- create API key through basic-auth admin route
- list API keys without exposing hashes or plaintext
- revoke API key
- rotate API key

Quality gates before PR:

```bash
make api
go test ./internal/api ./internal/core/services ./internal/repositories
make lint
```

If local Windows testing hits the existing rapidsnark build constraint, run the same checks in Linux Docker or GitHub Actions.

## Rollout Plan

1. Merge API key management without exposing any B2B endpoint.
2. Configure `ISSUER_API_KEY_PEPPER` in each environment.
3. Create one test partner key with a short expiry.
4. Add the first B2B KYC endpoint requiring `kyc:verify`.
5. Monitor audit events and failed auth counts.
6. Add rate limiting once request volume patterns are known.

## Open Decisions

- Whether partner keys should belong to a separate `partners` table from day one.
- Whether scope names should be hard-coded constants or database-driven.
- Whether rate limiting should be Redis-backed in the first implementation.
- Whether admin key management should live in issuer-node only or also expose UI controls later.
