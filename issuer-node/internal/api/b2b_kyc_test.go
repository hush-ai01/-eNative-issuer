package api

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestCredentialSubjectWithDID_whenIDIsMissing(t *testing.T) {
	// Given: a partner subject payload without a DID.
	subject := map[string]interface{}{"birthday": float64(19960424)}

	// When: the adapter normalizes the subject.
	got, err := credentialSubjectWithDID(subject, "did:example:solana-subject")

	// Then: the subject DID is added without mutating the caller's map.
	require.NoError(t, err)
	require.Equal(t, "did:example:solana-subject", got["id"])
	require.NotContains(t, subject, "id")
}

func TestCredentialSubjectWithDID_whenIDDoesNotMatch(t *testing.T) {
	// Given: a partner subject payload for a different DID.
	subject := map[string]interface{}{"id": "did:example:other-subject"}

	// When: the adapter normalizes the subject.
	got, err := credentialSubjectWithDID(subject, "did:example:solana-subject")

	// Then: the request is rejected before issuing a credential.
	require.ErrorContains(t, err, "credentialSubject.id must match subjectDID")
	require.Nil(t, got)
}

func TestB2BKYCVerificationResponse_whenCredentialIsCreated(t *testing.T) {
	// Given: a successful credential creation response.
	body := B2BKYCVerificationRequest{
		ENumber:    "EN-123456",
		SubjectDID: "did:example:solana-subject",
	}

	// When: the adapter maps it to the B2B response contract.
	got, err := b2bKYCVerificationResponse(body, CreateCredential201JSONResponse{Id: "credential-id"})

	// Then: the partner receives the KYC wrapper fields and credential ID.
	require.NoError(t, err)
	response, ok := got.(CreateB2BKYCVerification201JSONResponse)
	require.True(t, ok)
	require.Equal(t, "credential-id", response.CredentialId)
	require.Equal(t, "EN-123456", response.ENumber)
	require.Equal(t, "did:example:solana-subject", response.SubjectDID)
	require.Equal(t, CredentialIssued, response.Status)
}
