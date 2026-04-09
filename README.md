# eNative Issuer Node

Self-sovereign identity infrastructure for eNative — built on Polygon ID (W3C DID standard) with ZK proof support.

## What This Is

This repo contains the identity issuer backend for eNative. It handles:
- Issuing W3C Verifiable Credentials tied to eNumbers
- Zero-knowledge proof generation for selective identity disclosure
- On-chain DID anchoring via Polygon
- KYC API infrastructure (Phase 2)

## Stack
- Go (issuer API)
- PostgreSQL (credential storage)
- Redis (caching)
- Polygon ID issuer-node (0xPolygonID)
- Docker / Docker Compose

## Current Status

### Done
- [x] Polygon ID issuer-node cloned and configured
- [x] Infra running (Postgres + Redis + API + UI containers)
- [x] .env-issuer configured for local development
- [x] resolvers_settings.yaml configured
- [x] Go binary built successfully

### In Progress
- [ ] Fix database connection (API cant resolve postgres hostname in Codespaces)
- [ ] KMS key import (required before issuer can sign credentials)
- [ ] Test first credential issuance end to end

### Still To Build
- [ ] eNumber to DID linking (Supabase trigger -> issuer API)
- [ ] Credential issuance flow from eNative frontend
- [ ] ZK proof endpoint
- [ ] REST API wrapper for B2B KYC integrations
- [ ] API key management for B2B partners

## Running Locally

### Prerequisites
- Docker
- Go 1.21+
- Git

### Setup
```bash
git clone https://github.com/hush-ai01/-eNative-issuer
cd -eNative-issuer/issuer-node
touch .env-ui
make up
make build-local
make run-all-registry
Ports
API: http://localhost:3001
UI: http://localhost:8088
Roadmap Context
This repo is Phase 1 of the eNative roadmap:
Phase 1 (now): SSI infrastructure — DIDs, Verifiable Credentials, ZK proofs
Phase 2: B2B KYC API — REST API, API keys, partner dashboard
Phase 3: Consumer network — eNumber, P2P calling, messaging
Phase 4: Developer platform — SDK, fraud score API, Series A
Contact
Taryl Ogle — Founder, eNative / Eoniix
