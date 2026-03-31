import { supabase } from './supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

async function callFunction(name, body = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'API error')
  return data
}

async function callFunctionGet(name, params = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  const query = new URLSearchParams(params).toString()
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}${query ? '?' + query : ''}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'API error')
  return data
}

export const api = {
  registerENumber: () => callFunction('register-enumber'),
  verifyIdentity: (full_name, id_number, phone_number) => callFunction('verify-identity', { full_name, id_number, phone_number }),
  assignBadge: (badge_type, target_user_id) => callFunction('assign-badge', { badge_type, target_user_id }),
  getContacts: (search = '') => callFunctionGet('get-contacts', search ? { search } : {}),
  sendMessage: (recipient_enumber, content, message_type = 'text') => callFunction('send-message', { recipient_enumber, content, message_type }),
  initiateCall: (recipient_enumber, call_type = 'audio', sdp_offer) => callFunction('initiate-call', { recipient_enumber, call_type, sdp_offer })
}
