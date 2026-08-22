import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error('Authentication required');
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Authentication required');

    const { prompt, history, context, provider = 'gemini', model, temperature = 0.7 } = await request.json();
    if (provider !== 'gemini') throw new Error('Only Gemini is enabled for this deployment');
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error('Missing GEMINI_API_KEY server secret');

    const system = `You are Kedar AI, a practical personal assistant for ${context?.profile?.name || 'the user'}. Profile: ${JSON.stringify(context?.profile || {})}. Memories: ${JSON.stringify(context?.memories || [])}.`;
    let text = '';
    {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash'}:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [...(history || []).map((item: { role: string; content: string }) => ({ role: item.role === 'assistant' ? 'model' : 'user', parts: [{ text: item.content }] })), { role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature } })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Gemini request failed');
      text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'AI request failed' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
