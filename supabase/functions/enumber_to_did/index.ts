import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  const { enumber_id } = await req.json()

  // Fetch the eNumber record
  const { data: enumber, error } = await supabase
    .from("enumbers")
    .select("*")
    .eq("id", enumber_id)
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  // Call issuer API to create a DID for this eNumber
  const issuerUrl = "http://host.docker.internal:3001" // from inside Supabase function
  const issuerUser = Deno.env.get("ISSUER_API_AUTH_USER") || "user-issuer"
  const issuerPass = Deno.env.get("ISSUER_API_AUTH_PASSWORD") || "password-issuer"
  
  const credentials = btoa(`${issuerUser}:${issuerPass}`)
  
  const resp = await fetch(`${issuerUrl}/v2/identities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${credentials}`
    },
    body: JSON.stringify({
      didMetadata: {
        method: "polygonid",
        blockchain: "polygon",
        network: "amoy",
        type: "BJJ"   // or ETH, per your setup
      },
      displayName: enumber.number   // optional, helps identify the identity
    })
  })

  if (!resp.ok) {
    const err = await resp.text()
    return new Response(JSON.stringify({ error: `Issuer error: ${err}` }), { status: 500 })
  }

  const data = await resp.json()
  const did = data.identifier   // the issuer returns the DID as `identifier`

  // Update the eNumber with the DID
  const { error: updateError } = await supabase
    .from("enumbers")
    .update({ did })
    .eq("id", enumber_id)

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ did }), { status: 200 })
})
