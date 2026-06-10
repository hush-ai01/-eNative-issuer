package ports

import (
	"context"
	"time"

	"github.com/google/uuid"

	"github.com/polygonid/sh-id-platform/internal/core/domain"
)

// CreateAPIKeyRequest contains trusted, parsed input for creating a partner key.
type CreateAPIKeyRequest struct {
	PartnerName string
	Scopes      []string
	ExpiresAt   *time.Time
}

// CreatedAPIKey returns the newly-created metadata plus the one-time plaintext key.
type CreatedAPIKey struct {
	Key    domain.APIKey
	Secret string
}

// AuthenticatedAPIKey is returned after a successful key authentication.
type AuthenticatedAPIKey struct {
	Key domain.APIKey
}

// APIKeyService manages B2B partner API keys.
type APIKeyService interface {
	Create(ctx context.Context, req CreateAPIKeyRequest) (*CreatedAPIKey, error)
	List(ctx context.Context) ([]domain.APIKey, error)
	Get(ctx context.Context, id uuid.UUID) (*domain.APIKey, error)
	Rotate(ctx context.Context, id uuid.UUID) (*CreatedAPIKey, error)
	Revoke(ctx context.Context, id uuid.UUID, reason *string) error
	Authenticate(ctx context.Context, secret string, requiredScopes ...string) (*AuthenticatedAPIKey, error)
}
