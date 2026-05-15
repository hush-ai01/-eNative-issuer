import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const ISSUER_API_URL = Deno.env.get("ISSUER_API_URL") || "http://localhost:3001/v1/enumber-link";
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") || "dev-secret-key-do-not-use-in-prod";

interface DatabaseWebhookPayload {
  type: "INSERT" | "UPDATE";
  table: string;
  record: {
    id: string; // uuid
    e_number: string;
    verification_level: number;
    created_at: string;
  };
  schema: "public";
}

serve(async (req) => {
  try {
    const payload: DatabaseWebhookPayload = await req.json();

    // 1. Only process inserts for users who have an eNumber
    if (payload.type !== "INSERT" || !payload.record.e_number) {
      return new Response("Ignored: Not a valid eNumber creation event", { status: 200 });
    }

    console.log(`[Supabase Edge] New eNumber registered: ${payload.record.e_number}. Triggering Issuer Node...`);

    // 2. Prepare payload for the Go Issuer API
    const issuerPayload = {
      user_id: payload.record.id,
      e_number: payload.record.e_number,
      verification_level: payload.record.verification_level,
      timestamp: new Date().toISOString(),
    };

    // 3. Generate HMAC signature to prove this came from our Supabase instance
    const signature = createHmac("sha256", WEBHOOK_SECRET)
      .update(JSON.stringify(issuerPayload))
      .digest("hex");

    // 4. Fire the request to the Go backend
    const response = await fetch(ISSUER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Supabase-Signature": signature
      },
      body: JSON.stringify(issuerPayload)
    });

    if (!response.ok) {
      throw new Error(`Issuer API responded with status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`[Supabase Edge] Successfully triggered issuance for ${payload.record.e_number}. DID: ${result.did}`);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("[Supabase Edge] Error triggering issuer:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
