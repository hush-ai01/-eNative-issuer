# Supabase Integration for eNative

This directory contains Supabase functions and database schema for the eNative project.

## Files

- `migrations/20260515000001_create_enumbers_table.sql`: Creates the `enumbers` table with a `did` column
- `functions/enumber_to_did/index.ts`: Edge Function that links eNumbers to DIDs via the issuer API

## Setup

1. Install Supabase CLI if not already installed
2. Link to your Supabase project: `supabase link --project-ref YOUR_PROJECT_REF`
3. Apply database migrations: `supabase db push`
4. Deploy the function: `supabase functions deploy enumber_to_did`

## Usage

The function expects a JSON payload with an `enumber_id`:

```json
{
  "enumber_id": "uuid-of-enumber-record"
}
```

It will:
1. Fetch the eNumber record from Supabase
2. Call the issuer-node API to create a DID for that eNumber
3. Store the DID back in the eNumber record
4. Return the DID

## Development

To test locally:

1. Start the issuer-node stack (see root README)
2. Start Supabase locally: `supabase start`
3. Link to local instance: `supabase link --project-ref local`
4. Apply migrations: `supabase db push --local`
5. Deploy function (local mode): `supabase functions deploy enumber_to_did --no-verify-jwt`

## Notes

- The function currently uses a placeholder DID format: `did:poly:id:testnet:{number}`
- To use the real issuer API, replace the placeholder logic in the function with an actual HTTP call
- See the function source code for the TODO comment marking where to implement the real API call

