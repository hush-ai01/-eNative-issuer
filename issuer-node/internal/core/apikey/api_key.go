package apikey

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"errors"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/polygonid/sh-id-platform/internal/core/domain"
	"github.com/polygonid/sh-id-platform/internal/core/ports"
	"github.com/polygonid/sh-id-platform/internal/repositories"
)

const (
	apiKeyPrefixBytes = 9
	apiKeySecretBytes = 32
	apiKeyTokenPrefix = "enat_live"
)

var (
	ErrNotFound       = errors.New("api key not found")
	ErrInvalid        = errors.New("invalid api key")
	ErrRevoked        = errors.New("api key revoked")
	ErrExpired        = errors.New("api key expired")
	ErrMissingScope   = errors.New("api key missing required scope")
	ErrInvalidRequest = errors.New("invalid api key request")
	ErrPepperMissing  = errors.New("api key pepper is required")
)

type service struct {
	repository ports.APIKeyRepository
	pepper     []byte
}

// New creates an API-key management service.
func New(repository ports.APIKeyRepository, pepper string) ports.APIKeyService {
	return &service{repository: repository, pepper: []byte(pepper)}
}

func (s *service) Create(ctx context.Context, req ports.CreateAPIKeyRequest) (*ports.CreatedAPIKey, error) {
	if len(s.pepper) == 0 {
		return nil, ErrPepperMissing
	}
	partnerName := strings.TrimSpace(req.PartnerName)
	scopes, err := normalizeScopes(req.Scopes)
	if err != nil {
		return nil, err
	}
	prefix, secret, err := newSecret()
	if err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	key := &domain.APIKey{
		ID:          uuid.New(),
		PartnerName: partnerName,
		KeyPrefix:   prefix,
		KeyHash:     s.hash(secret),
		Scopes:      scopes,
		Status:      domain.APIKeyStatusActive,
		CreatedAt:   now,
		ExpiresAt:   req.ExpiresAt,
	}
	if key.PartnerName == "" {
		return nil, ErrInvalidRequest
	}
	if err := s.repository.Save(ctx, key); err != nil {
		return nil, err
	}
	_ = s.repository.SaveEvent(ctx, &domain.APIKeyEvent{
		ID:        uuid.New(),
		APIKeyID:  key.ID,
		EventType: "created",
		CreatedAt: now,
		Metadata:  []byte("{}"),
	})
	return &ports.CreatedAPIKey{Key: *key, Secret: secret}, nil
}

func (s *service) List(ctx context.Context) ([]domain.APIKey, error) {
	return s.repository.GetAll(ctx)
}

func (s *service) Get(ctx context.Context, id uuid.UUID) (*domain.APIKey, error) {
	key, err := s.repository.GetByID(ctx, id)
	if err != nil {
		return nil, apiKeyError(err)
	}
	return key, nil
}

func (s *service) Rotate(ctx context.Context, id uuid.UUID) (*ports.CreatedAPIKey, error) {
	existing, err := s.repository.GetByID(ctx, id)
	if err != nil {
		return nil, apiKeyError(err)
	}
	now := time.Now().UTC()
	reason := "rotated"
	if err := s.repository.Revoke(ctx, id, now, &reason); err != nil {
		return nil, apiKeyError(err)
	}
	created, err := s.Create(ctx, ports.CreateAPIKeyRequest{
		PartnerName: existing.PartnerName,
		Scopes:      existing.Scopes,
		ExpiresAt:   existing.ExpiresAt,
	})
	if err != nil {
		return nil, err
	}
	_ = s.repository.SaveEvent(ctx, &domain.APIKeyEvent{
		ID:        uuid.New(),
		APIKeyID:  id,
		EventType: "rotated",
		CreatedAt: now,
		Metadata:  []byte(fmt.Sprintf(`{"replacementKeyId":"%s"}`, created.Key.ID.String())),
	})
	return created, nil
}

func (s *service) Revoke(ctx context.Context, id uuid.UUID, reason *string) error {
	now := time.Now().UTC()
	if err := s.repository.Revoke(ctx, id, now, reason); err != nil {
		return apiKeyError(err)
	}
	_ = s.repository.SaveEvent(ctx, &domain.APIKeyEvent{
		ID:        uuid.New(),
		APIKeyID:  id,
		EventType: "revoked",
		CreatedAt: now,
		Metadata:  []byte("{}"),
	})
	return nil
}

func (s *service) Authenticate(ctx context.Context, secret string, requiredScopes ...string) (*ports.AuthenticatedAPIKey, error) {
	if len(s.pepper) == 0 {
		return nil, ErrPepperMissing
	}
	prefix, ok := parsePrefix(secret)
	if !ok {
		return nil, ErrInvalid
	}
	key, err := s.repository.GetByPrefix(ctx, prefix)
	if err != nil {
		return nil, apiKeyError(err)
	}
	if subtle.ConstantTimeCompare(s.hash(secret), key.KeyHash) != 1 {
		return nil, ErrInvalid
	}
	if key.Status == domain.APIKeyStatusRevoked || key.RevokedAt != nil {
		return nil, ErrRevoked
	}
	if key.ExpiresAt != nil && time.Now().UTC().After(*key.ExpiresAt) {
		return nil, ErrExpired
	}
	if !hasRequiredScopes(key.Scopes, requiredScopes) {
		return nil, ErrMissingScope
	}
	usedAt := time.Now().UTC()
	_ = s.repository.UpdateLastUsedAt(ctx, key.ID, usedAt)
	key.LastUsedAt = &usedAt
	return &ports.AuthenticatedAPIKey{Key: *key}, nil
}

func apiKeyError(err error) error {
	if errors.Is(err, repositories.ErrAPIKeyNotFound) {
		return ErrNotFound
	}
	return err
}

func (s *service) hash(secret string) []byte {
	mac := hmac.New(sha256.New, s.pepper)
	mac.Write([]byte(secret))
	return mac.Sum(nil)
}

func newSecret() (string, string, error) {
	prefixRaw := make([]byte, apiKeyPrefixBytes)
	secretRaw := make([]byte, apiKeySecretBytes)
	if _, err := rand.Read(prefixRaw); err != nil {
		return "", "", err
	}
	if _, err := rand.Read(secretRaw); err != nil {
		return "", "", err
	}
	prefixPart := hex.EncodeToString(prefixRaw)
	secretPart := hex.EncodeToString(secretRaw)
	prefix := apiKeyTokenPrefix + "_" + prefixPart
	return prefix, prefix + "_" + secretPart, nil
}

func parsePrefix(secret string) (string, bool) {
	lastSeparator := strings.LastIndex(secret, "_")
	if lastSeparator <= 0 || lastSeparator == len(secret)-1 {
		return "", false
	}
	prefix := secret[:lastSeparator]
	if !strings.HasPrefix(prefix, apiKeyTokenPrefix+"_") {
		return "", false
	}
	return prefix, true
}

func normalizeScopes(scopes []string) ([]string, error) {
	if len(scopes) == 0 {
		return nil, ErrInvalidRequest
	}
	seen := make(map[string]struct{}, len(scopes))
	normalized := make([]string, 0, len(scopes))
	for _, scope := range scopes {
		trimmed := strings.TrimSpace(scope)
		if trimmed == "" {
			return nil, ErrInvalidRequest
		}
		if _, ok := seen[trimmed]; ok {
			continue
		}
		seen[trimmed] = struct{}{}
		normalized = append(normalized, trimmed)
	}
	sort.Strings(normalized)
	return normalized, nil
}

func hasRequiredScopes(actual []string, required []string) bool {
	if len(required) == 0 {
		return true
	}
	actualSet := make(map[string]struct{}, len(actual))
	for _, scope := range actual {
		actualSet[scope] = struct{}{}
	}
	for _, scope := range required {
		if _, ok := actualSet[scope]; !ok {
			return false
		}
	}
	return true
}
