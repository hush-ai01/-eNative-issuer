package apikeyservice_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"

	"github.com/polygonid/sh-id-platform/internal/core/apikey"
	"github.com/polygonid/sh-id-platform/internal/core/domain"
	"github.com/polygonid/sh-id-platform/internal/core/ports"
)

func TestAPIKeyCreateAndAuthenticate_whenRequestIsValid(t *testing.T) {
	// Given: an API key service with an in-memory repository.
	ctx := context.Background()
	repo := newFakeAPIKeyRepository()
	service := apikey.New(repo, "test-pepper")

	// When: a partner key is created and authenticated with a required scope.
	created, err := service.Create(ctx, ports.CreateAPIKeyRequest{
		PartnerName: "Acme KYC",
		Scopes:      []string{"kyc:verify", "kyc:read"},
	})
	require.NoError(t, err)
	authenticated, err := service.Authenticate(ctx, created.Secret, "kyc:verify")

	// Then: the plaintext secret is returned once and only the hash is persisted.
	require.NoError(t, err)
	require.Equal(t, created.Key.ID, authenticated.Key.ID)
	require.NotContains(t, string(repo.keys[created.Key.ID].KeyHash), created.Secret)
	require.NotEmpty(t, repo.keys[created.Key.ID].LastUsedAt)
}

func TestAPIKeyAuthenticate_whenScopeIsMissing(t *testing.T) {
	// Given: a key that has only read access.
	ctx := context.Background()
	repo := newFakeAPIKeyRepository()
	service := apikey.New(repo, "test-pepper")
	created, err := service.Create(ctx, ports.CreateAPIKeyRequest{
		PartnerName: "Read Partner",
		Scopes:      []string{"kyc:read"},
	})
	require.NoError(t, err)

	// When: authentication requires write-style verification access.
	_, err = service.Authenticate(ctx, created.Secret, "kyc:verify")

	// Then: the service rejects the key with a typed scope error.
	require.ErrorIs(t, err, apikey.ErrMissingScope)
}

func TestAPIKeyAuthenticate_whenMultiplePartnersHaveDifferentScopes(t *testing.T) {
	// Given: two partners with different API keys and different permissions.
	ctx := context.Background()
	repo := newFakeAPIKeyRepository()
	service := apikey.New(repo, "test-pepper")
	readPartner, err := service.Create(ctx, ports.CreateAPIKeyRequest{
		PartnerName: "Read Partner",
		Scopes:      []string{"kyc:read"},
	})
	require.NoError(t, err)
	issuePartner, err := service.Create(ctx, ports.CreateAPIKeyRequest{
		PartnerName: "Issuer Partner",
		Scopes:      []string{"credential:issue"},
	})
	require.NoError(t, err)

	// When: each partner authenticates against its own allowed scope.
	readAuth, err := service.Authenticate(ctx, readPartner.Secret, "kyc:read")
	require.NoError(t, err)
	issueAuth, err := service.Authenticate(ctx, issuePartner.Secret, "credential:issue")
	require.NoError(t, err)

	// Then: each secret resolves to its own partner record, not a shared global key.
	require.NotEqual(t, readAuth.Key.ID, issueAuth.Key.ID)
	require.Equal(t, "Read Partner", readAuth.Key.PartnerName)
	require.Equal(t, "Issuer Partner", issueAuth.Key.PartnerName)

	// And: one partner's key cannot be reused for the other's scope.
	_, err = service.Authenticate(ctx, readPartner.Secret, "credential:issue")
	require.ErrorIs(t, err, apikey.ErrMissingScope)
	_, err = service.Authenticate(ctx, issuePartner.Secret, "kyc:read")
	require.ErrorIs(t, err, apikey.ErrMissingScope)
}

func TestAPIKeyAuthenticate_whenKeyIsRevoked(t *testing.T) {
	// Given: a created API key.
	ctx := context.Background()
	repo := newFakeAPIKeyRepository()
	service := apikey.New(repo, "test-pepper")
	created, err := service.Create(ctx, ports.CreateAPIKeyRequest{
		PartnerName: "Revoked Partner",
		Scopes:      []string{"kyc:verify"},
	})
	require.NoError(t, err)

	// When: the key is revoked and then used.
	require.NoError(t, service.Revoke(ctx, created.Key.ID, nil))
	_, err = service.Authenticate(ctx, created.Secret, "kyc:verify")

	// Then: authentication fails as revoked.
	require.ErrorIs(t, err, apikey.ErrRevoked)
}

func TestAPIKeyRotate_whenKeyExists(t *testing.T) {
	// Given: an active API key.
	ctx := context.Background()
	repo := newFakeAPIKeyRepository()
	service := apikey.New(repo, "test-pepper")
	created, err := service.Create(ctx, ports.CreateAPIKeyRequest{
		PartnerName: "Rotate Partner",
		Scopes:      []string{"credential:issue"},
	})
	require.NoError(t, err)

	// When: the key is rotated.
	replacement, err := service.Rotate(ctx, created.Key.ID)

	// Then: the replacement has the same partner/scopes and the old key no longer authenticates.
	require.NoError(t, err)
	require.NotEqual(t, created.Secret, replacement.Secret)
	require.Equal(t, created.Key.PartnerName, replacement.Key.PartnerName)
	require.Equal(t, created.Key.Scopes, replacement.Key.Scopes)
	_, err = service.Authenticate(ctx, created.Secret, "credential:issue")
	require.ErrorIs(t, err, apikey.ErrRevoked)
}

func TestAPIKeyCreate_whenPepperIsMissing(t *testing.T) {
	// Given: an API key service without a pepper.
	service := apikey.New(newFakeAPIKeyRepository(), "")

	// When: a key is created.
	_, err := service.Create(context.Background(), ports.CreateAPIKeyRequest{
		PartnerName: "No Pepper",
		Scopes:      []string{"kyc:read"},
	})

	// Then: creation is refused because hashes would not be protected by server-side secret material.
	require.ErrorIs(t, err, apikey.ErrPepperMissing)
}

type fakeAPIKeyRepository struct {
	keys map[uuid.UUID]*domain.APIKey
}

func newFakeAPIKeyRepository() *fakeAPIKeyRepository {
	return &fakeAPIKeyRepository{keys: make(map[uuid.UUID]*domain.APIKey)}
}

func (r *fakeAPIKeyRepository) Save(_ context.Context, key *domain.APIKey) error {
	copyKey := *key
	copyKey.Scopes = append([]string(nil), key.Scopes...)
	copyKey.KeyHash = append([]byte(nil), key.KeyHash...)
	r.keys[key.ID] = &copyKey
	return nil
}

func (r *fakeAPIKeyRepository) GetByID(_ context.Context, id uuid.UUID) (*domain.APIKey, error) {
	key, ok := r.keys[id]
	if !ok {
		return nil, apikey.ErrNotFound
	}
	copyKey := *key
	return &copyKey, nil
}

func (r *fakeAPIKeyRepository) GetByPrefix(_ context.Context, prefix string) (*domain.APIKey, error) {
	for _, key := range r.keys {
		if key.KeyPrefix == prefix {
			copyKey := *key
			return &copyKey, nil
		}
	}
	return nil, apikey.ErrNotFound
}

func (r *fakeAPIKeyRepository) GetAll(context.Context) ([]domain.APIKey, error) {
	keys := make([]domain.APIKey, 0, len(r.keys))
	for _, key := range r.keys {
		keys = append(keys, *key)
	}
	return keys, nil
}

func (r *fakeAPIKeyRepository) Revoke(_ context.Context, id uuid.UUID, revokedAt time.Time, reason *string) error {
	key, ok := r.keys[id]
	if !ok {
		return apikey.ErrNotFound
	}
	key.Status = domain.APIKeyStatusRevoked
	key.RevokedAt = &revokedAt
	key.RevokedReason = reason
	return nil
}

func (r *fakeAPIKeyRepository) UpdateLastUsedAt(_ context.Context, id uuid.UUID, usedAt time.Time) error {
	key, ok := r.keys[id]
	if !ok {
		return apikey.ErrNotFound
	}
	key.LastUsedAt = &usedAt
	return nil
}

func (r *fakeAPIKeyRepository) SaveEvent(context.Context, *domain.APIKeyEvent) error {
	return nil
}

func TestFakeAPIKeyRepository_whenKeyIsMissing(t *testing.T) {
	// Given: an empty fake repository.
	repo := newFakeAPIKeyRepository()

	// When: an unknown key is requested.
	_, err := repo.GetByID(context.Background(), uuid.New())

	// Then: callers receive the service-compatible not-found error.
	require.True(t, errors.Is(err, apikey.ErrNotFound))
}
