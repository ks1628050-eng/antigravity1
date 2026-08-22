import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });

async function signatureFor(orderId: string, paymentId: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${orderId}|${paymentId}`));
  return Array.from(new Uint8Array(bytes)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers });
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Authentication required' }, 401);
    const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await client.auth.getUser();
    if (!user) return json({ error: 'Authentication required' }, 401);
    const body = await request.json();
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpaySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!razorpayKeyId || !razorpaySecret) return json({ error: 'Payment provider is not configured' }, 503);

    if (body.action === 'create-order') {
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(`${razorpayKeyId}:${razorpaySecret}`)}` },
        body: JSON.stringify({ amount: Math.round(Number(body.amount) * 100), currency: 'INR', receipt: `kedar_${user.id.slice(0, 8)}_${Date.now()}` })
      });
      const data = await response.json();
      if (!response.ok) return json({ error: data.error?.description || 'Unable to create payment order' }, 400);
      return json({ orderId: data.id, amount: data.amount, currency: data.currency });
    }

    if (body.action === 'verify') {
      const expected = await signatureFor(body.orderId, body.paymentId, razorpaySecret);
      if (expected !== body.signature) return json({ error: 'Invalid payment signature', verified: false }, 400);
      return json({ verified: true, paymentId: body.paymentId });
    }
    return json({ error: 'Unknown payment action' }, 400);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Payment request failed' }, 400);
  }
});
