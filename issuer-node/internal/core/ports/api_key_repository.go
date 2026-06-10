package ports

import (
	"context"
	"time"

	"github.com/google/uuid"

	"github.com/polygonid/sh-id-platform/internal/core/domain"
)

// APIKeyRepository persists partner API keys and audit events.
type APIKeyRepository interface {
	Save(ctx context.Context, key *domain.APIKey) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.APIKey, error)
	GetByPrefix(ctx context.Context, prefix string) (*domain.APIKey, error)
	GetAll(ctx context.Context) ([]domain.APIKey, error)
	Revoke(ctx context.Context, id uuid.UUID, revokedAt time.Time, reason *string) error
	UpdateLastUsedAt(ctx context.Context, id uuid.UUID, usedAt time.Time) error
	SaveEvent(ctx context.Context, event *domain.APIKeyEvent) error
}
