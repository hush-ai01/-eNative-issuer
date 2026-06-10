package repositories

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
	"github.com/lib/pq"

	"github.com/polygonid/sh-id-platform/internal/core/domain"
	"github.com/polygonid/sh-id-platform/internal/core/ports"
	"github.com/polygonid/sh-id-platform/internal/db"
)

// ErrAPIKeyNotFound indicates that an API key row was not found.
var ErrAPIKeyNotFound = errors.New("api key not found")

type apiKeyRepository struct {
	conn db.Storage
}

// NewAPIKey creates a new API key repository.
func NewAPIKey(conn db.Storage) ports.APIKeyRepository {
	return &apiKeyRepository{conn: conn}
}

func (r *apiKeyRepository) Save(ctx context.Context, key *domain.APIKey) error {
	const query = `
INSERT INTO api_keys (id, partner_name, key_prefix, key_hash, scopes, status, created_at, expires_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`
	_, err := r.conn.Pgx.Exec(ctx, query, key.ID, key.PartnerName, key.KeyPrefix, key.KeyHash, pq.Array(key.Scopes), key.Status, key.CreatedAt, key.ExpiresAt)
	if err != nil {
		return fmt.Errorf("could not save api key: %w", err)
	}
	return nil
}

func (r *apiKeyRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.APIKey, error) {
	const query = `
SELECT id, partner_name, key_prefix, key_hash, scopes, status, created_at, last_used_at, expires_at, revoked_at, revoked_reason
FROM api_keys
WHERE id = $1;`
	return scanAPIKey(r.conn.Pgx.QueryRow(ctx, query, id))
}

func (r *apiKeyRepository) GetByPrefix(ctx context.Context, prefix string) (*domain.APIKey, error) {
	const query = `
SELECT id, partner_name, key_prefix, key_hash, scopes, status, created_at, last_used_at, expires_at, revoked_at, revoked_reason
FROM api_keys
WHERE key_prefix = $1;`
	return scanAPIKey(r.conn.Pgx.QueryRow(ctx, query, prefix))
}

func (r *apiKeyRepository) GetAll(ctx context.Context) ([]domain.APIKey, error) {
	const query = `
SELECT id, partner_name, key_prefix, key_hash, scopes, status, created_at, last_used_at, expires_at, revoked_at, revoked_reason
FROM api_keys
ORDER BY created_at DESC;`
	rows, err := r.conn.Pgx.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("could not list api keys: %w", err)
	}
	defer rows.Close()

	keys := make([]domain.APIKey, 0)
	for rows.Next() {
		key, err := scanAPIKey(rows)
		if err != nil {
			return nil, err
		}
		keys = append(keys, *key)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("could not read api keys: %w", err)
	}
	return keys, nil
}

func (r *apiKeyRepository) Revoke(ctx context.Context, id uuid.UUID, revokedAt time.Time, reason *string) error {
	const query = `
UPDATE api_keys
SET status = $1, revoked_at = $2, revoked_reason = $3
WHERE id = $4;`
	tag, err := r.conn.Pgx.Exec(ctx, query, domain.APIKeyStatusRevoked, revokedAt, reason, id)
	if err != nil {
		return fmt.Errorf("could not revoke api key: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrAPIKeyNotFound
	}
	return nil
}

func (r *apiKeyRepository) UpdateLastUsedAt(ctx context.Context, id uuid.UUID, usedAt time.Time) error {
	const query = `UPDATE api_keys SET last_used_at = $1 WHERE id = $2;`
	tag, err := r.conn.Pgx.Exec(ctx, query, usedAt, id)
	if err != nil {
		return fmt.Errorf("could not update api key last used time: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrAPIKeyNotFound
	}
	return nil
}

func (r *apiKeyRepository) SaveEvent(ctx context.Context, event *domain.APIKeyEvent) error {
	const query = `
INSERT INTO api_key_events (id, api_key_id, event_type, ip_address, user_agent, created_at, metadata)
VALUES ($1, $2, $3, $4, $5, $6, $7);`
	metadata := event.Metadata
	if len(metadata) == 0 {
		metadata = []byte("{}")
	}
	if !json.Valid(metadata) {
		return errors.New("invalid api key event metadata")
	}
	_, err := r.conn.Pgx.Exec(ctx, query, event.ID, event.APIKeyID, event.EventType, event.IPAddress, event.UserAgent, event.CreatedAt, metadata)
	if err != nil {
		return fmt.Errorf("could not save api key event: %w", err)
	}
	return nil
}

type rowScanner interface {
	Scan(dest ...interface{}) error
}

func scanAPIKey(row rowScanner) (*domain.APIKey, error) {
	var key domain.APIKey
	var scopes []string
	err := row.Scan(
		&key.ID,
		&key.PartnerName,
		&key.KeyPrefix,
		&key.KeyHash,
		pq.Array(&scopes),
		&key.Status,
		&key.CreatedAt,
		&key.LastUsedAt,
		&key.ExpiresAt,
		&key.RevokedAt,
		&key.RevokedReason,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrAPIKeyNotFound
		}
		return nil, fmt.Errorf("could not scan api key: %w", err)
	}
	key.Scopes = scopes
	return &key, nil
}
