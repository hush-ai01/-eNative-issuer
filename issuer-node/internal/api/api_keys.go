package api

import (
	"context"
	"errors"

	"github.com/polygonid/sh-id-platform/internal/core/apikey"
	"github.com/polygonid/sh-id-platform/internal/core/domain"
	"github.com/polygonid/sh-id-platform/internal/core/ports"
)

// CreateAPIKey is the handler for POST /v2/api-keys.
func (s *Server) CreateAPIKey(ctx context.Context, request CreateAPIKeyRequestObject) (CreateAPIKeyResponseObject, error) {
	if request.Body == nil {
		return CreateAPIKey400JSONResponse{N400JSONResponse{Message: "request body is required"}}, nil
	}
	created, err := s.apiKeyService.Create(ctx, ports.CreateAPIKeyRequest{
		PartnerName: request.Body.PartnerName,
		Scopes:      apiKeyScopesToStrings(request.Body.Scopes),
		ExpiresAt:   request.Body.ExpiresAt,
	})
	if err != nil {
		if errors.Is(err, apikey.ErrInvalidRequest) || errors.Is(err, apikey.ErrPepperMissing) {
			return CreateAPIKey400JSONResponse{N400JSONResponse{Message: err.Error()}}, nil
		}
		return CreateAPIKey500JSONResponse{N500JSONResponse{Message: err.Error()}}, nil
	}
	return CreateAPIKey201JSONResponse(apiKeyCreateResponse(created)), nil
}

// GetAPIKeys is the handler for GET /v2/api-keys.
func (s *Server) GetAPIKeys(ctx context.Context, _ GetAPIKeysRequestObject) (GetAPIKeysResponseObject, error) {
	keys, err := s.apiKeyService.List(ctx)
	if err != nil {
		return GetAPIKeys500JSONResponse{N500JSONResponse{Message: err.Error()}}, nil
	}
	items := make([]APIKey, 0, len(keys))
	for _, key := range keys {
		items = append(items, apiKeyResponse(key))
	}
	return GetAPIKeys200JSONResponse{Items: items}, nil
}

// GetAPIKey is the handler for GET /v2/api-keys/{id}.
func (s *Server) GetAPIKey(ctx context.Context, request GetAPIKeyRequestObject) (GetAPIKeyResponseObject, error) {
	key, err := s.apiKeyService.Get(ctx, request.Id)
	if err != nil {
		if errors.Is(err, apikey.ErrNotFound) {
			return GetAPIKey404JSONResponse{N404JSONResponse{Message: "api key not found"}}, nil
		}
		return GetAPIKey500JSONResponse{N500JSONResponse{Message: err.Error()}}, nil
	}
	return GetAPIKey200JSONResponse(apiKeyResponse(*key)), nil
}

// RotateAPIKey is the handler for POST /v2/api-keys/{id}/rotate.
func (s *Server) RotateAPIKey(ctx context.Context, request RotateAPIKeyRequestObject) (RotateAPIKeyResponseObject, error) {
	created, err := s.apiKeyService.Rotate(ctx, request.Id)
	if err != nil {
		if errors.Is(err, apikey.ErrNotFound) {
			return RotateAPIKey404JSONResponse{N404JSONResponse{Message: "api key not found"}}, nil
		}
		return RotateAPIKey500JSONResponse{N500JSONResponse{Message: err.Error()}}, nil
	}
	return RotateAPIKey201JSONResponse(apiKeyCreateResponse(created)), nil
}

// RevokeAPIKey is the handler for POST /v2/api-keys/{id}/revoke.
func (s *Server) RevokeAPIKey(ctx context.Context, request RevokeAPIKeyRequestObject) (RevokeAPIKeyResponseObject, error) {
	var reason *string
	if request.Body != nil {
		reason = request.Body.Reason
	}
	if err := s.apiKeyService.Revoke(ctx, request.Id, reason); err != nil {
		if errors.Is(err, apikey.ErrNotFound) {
			return RevokeAPIKey404JSONResponse{N404JSONResponse{Message: "api key not found"}}, nil
		}
		return RevokeAPIKey500JSONResponse{N500JSONResponse{Message: err.Error()}}, nil
	}
	return RevokeAPIKey200JSONResponse{Message: "api key revoked"}, nil
}

func apiKeyCreateResponse(created *ports.CreatedAPIKey) CreateAPIKeyResponse {
	key := apiKeyResponse(created.Key)
	return CreateAPIKeyResponse{
		ApiKey:        created.Secret,
		CreatedAt:     key.CreatedAt,
		ExpiresAt:     key.ExpiresAt,
		Id:            key.Id,
		KeyPrefix:     key.KeyPrefix,
		LastUsedAt:    key.LastUsedAt,
		PartnerName:   key.PartnerName,
		RevokedAt:     key.RevokedAt,
		RevokedReason: key.RevokedReason,
		Scopes:        key.Scopes,
		Status:        key.Status,
	}
}

func apiKeyResponse(key domain.APIKey) APIKey {
	return APIKey{
		CreatedAt:     key.CreatedAt,
		ExpiresAt:     key.ExpiresAt,
		Id:            key.ID,
		KeyPrefix:     key.KeyPrefix,
		LastUsedAt:    key.LastUsedAt,
		PartnerName:   key.PartnerName,
		RevokedAt:     key.RevokedAt,
		RevokedReason: key.RevokedReason,
		Scopes:        stringsToAPIKeyScopes(key.Scopes),
		Status:        APIKeyStatus(key.Status),
	}
}

func apiKeyScopesToStrings(scopes []APIKeyScope) []string {
	result := make([]string, 0, len(scopes))
	for _, scope := range scopes {
		result = append(result, string(scope))
	}
	return result
}

func stringsToAPIKeyScopes(scopes []string) []APIKeyScope {
	result := make([]APIKeyScope, 0, len(scopes))
	for _, scope := range scopes {
		result = append(result, APIKeyScope(scope))
	}
	return result
}
