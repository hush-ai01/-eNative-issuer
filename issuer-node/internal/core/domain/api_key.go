package domain

import (
	"time"

	"github.com/google/uuid"
)

// APIKeyStatus represents the persisted lifecycle state for a partner API key.
type APIKeyStatus string

const (
	APIKeyStatusActive  APIKeyStatus = "active"
	APIKeyStatusRevoked APIKeyStatus = "revoked"
)

// APIKey is the stored metadata for a B2B partner API key.
type APIKey struct {
	ID            uuid.UUID
	PartnerName   string
	KeyPrefix     string
	KeyHash       []byte
	Scopes        []string
	Status        APIKeyStatus
	CreatedAt     time.Time
	LastUsedAt    *time.Time
	ExpiresAt     *time.Time
	RevokedAt     *time.Time
	RevokedReason *string
}

// APIKeyEvent records auditable API-key lifecycle and authentication events.
type APIKeyEvent struct {
	ID        uuid.UUID
	APIKeyID  uuid.UUID
	EventType string
	IPAddress *string
	UserAgent *string
	CreatedAt time.Time
	Metadata  []byte
}
