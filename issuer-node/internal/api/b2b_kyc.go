package api

import (
	"context"
	"fmt"
	"time"
)

// CreateB2BKYCVerification adapts partner KYC requests to the issuer credential pipeline.
func (s *Server) CreateB2BKYCVerification(ctx context.Context, request CreateB2BKYCVerificationRequestObject) (CreateB2BKYCVerificationResponseObject, error) {
	if request.Body == nil {
		return CreateB2BKYCVerification400JSONResponse{N400JSONResponse{Message: "request body is required"}}, nil
	}

	credentialSubject, err := credentialSubjectWithDID(request.Body.CredentialSubject, request.Body.SubjectDID)
	if err != nil {
		return CreateB2BKYCVerification400JSONResponse{N400JSONResponse{Message: err.Error()}}, nil
	}

	credentialResponse, err := s.CreateCredential(ctx, CreateCredentialRequestObject{
		Identifier: request.Identifier,
		Body: &CreateCredentialJSONRequestBody{
			CredentialSchema:  request.Body.CredentialSchema,
			CredentialSubject: credentialSubject,
			Expiration:        request.Body.Expiration,
			Type:              request.Body.Type,
			Version:           request.Body.Version,
		},
	})
	if err != nil {
		return nil, err
	}

	return b2bKYCVerificationResponse(*request.Body, credentialResponse)
}

func credentialSubjectWithDID(subject map[string]interface{}, subjectDID string) (map[string]interface{}, error) {
	normalized := make(map[string]interface{}, len(subject)+1)
	for key, value := range subject {
		normalized[key] = value
	}

	existingID, ok := normalized["id"]
	if !ok {
		normalized["id"] = subjectDID
		return normalized, nil
	}

	existingDID, ok := existingID.(string)
	if !ok {
		return nil, fmt.Errorf("credentialSubject.id must be a string")
	}
	if existingDID != subjectDID {
		return nil, fmt.Errorf("credentialSubject.id must match subjectDID")
	}
	return normalized, nil
}

func b2bKYCVerificationResponse(body B2BKYCVerificationRequest, credentialResponse CreateCredentialResponseObject) (CreateB2BKYCVerificationResponseObject, error) {
	switch response := credentialResponse.(type) {
	case CreateCredential201JSONResponse:
		return CreateB2BKYCVerification201JSONResponse{
			CredentialId: response.Id,
			ENumber:      body.ENumber,
			IssuedAt:     TimeUTC(time.Now()),
			Status:       CredentialIssued,
			SubjectDID:   body.SubjectDID,
		}, nil
	case CreateCredential400JSONResponse:
		return CreateB2BKYCVerification400JSONResponse{N400JSONResponse: response.N400JSONResponse}, nil
	case CreateCredential401JSONResponse:
		return CreateB2BKYCVerification401JSONResponse{N401JSONResponse: response.N401JSONResponse}, nil
	case CreateCredential422JSONResponse:
		return CreateB2BKYCVerification422JSONResponse{N422JSONResponse: response.N422JSONResponse}, nil
	case CreateCredential500JSONResponse:
		return CreateB2BKYCVerification500JSONResponse{N500JSONResponse: response.N500JSONResponse}, nil
	default:
		return CreateB2BKYCVerification500JSONResponse{N500JSONResponse{Message: fmt.Sprintf("unexpected credential response type: %T", credentialResponse)}}, nil
	}
}
