import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Unauthorized: Invalid or expired authentication session');
      }
    }

    const body = await request.json();
    const { 
      prompt, 
      history = [], 
      context = {}, 
      provider: requestedProvider, 
      model: requestedModel, 
      temperature = 0.7 
    } = body;

    const provider = requestedProvider || Deno.env.get('AI_PROVIDER') || 'gemini';
    const model = requestedModel || Deno.env.get('AI_MODEL');

    // Build system prompt with memories
    const memList = Array.isArray(context?.memories) && context.memories.length > 0
      ? `\n\nUSER MEMORIES:\n${context.memories.map((m: any) => `- [${m.category || 'General'}] ${m.content}`).join('\n')}`
      : '';

    const systemPrompt = (context?.systemRole || `You are Kedar AI, an elite AI mentor and super-copilot for ${context?.profile?.name || 'the student'}. Student Branch: ${context?.profile?.branch || 'Engineering'}, College: ${context?.profile?.college || 'University'}. Focus on high-quality, structured, verified answers with code blocks and clean markdown.`) + memList;

    let responseText = '';

    // Provider 1: Google Gemini
    if (provider === 'gemini' || provider === 'kedar-ai') {
      const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('AI_API_KEY');
      if (!apiKey) throw new Error('Missing GEMINI_API_KEY in server environment variables');

      const targetModel = model || 'gemini-2.0-flash';
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

      const contents = [
        ...history.map((msg: { role: string; content: string }) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })),
        { role: 'user', parts: [{ text: prompt }] }
      ];

      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { temperature, maxOutputTokens: 4096 }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || `Gemini API returned error code ${res.status}`);
      }
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    // Provider 2: Groq
    else if (provider === 'groq') {
      const apiKey = Deno.env.get('GROQ_API_KEY') || Deno.env.get('AI_API_KEY');
      if (!apiKey) throw new Error('Missing GROQ_API_KEY in server environment variables');

      const targetModel = model || 'llama-3.3-70b-versatile';
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map((msg: { role: string; content: string }) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content: prompt }
      ];

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: targetModel,
          messages,
          temperature,
          max_tokens: 4096
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || `Groq API returned error code ${res.status}`);
      }
      responseText = data.choices?.[0]?.message?.content || '';
    }

    // Provider 3: OpenAI
    else if (provider === 'openai') {
      const apiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('AI_API_KEY');
      if (!apiKey) throw new Error('Missing OPENAI_API_KEY in server environment variables');

      const targetModel = model || 'gpt-4o-mini';
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map((msg: { role: string; content: string }) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content: prompt }
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: targetModel,
          messages,
          temperature
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || `OpenAI API returned error code ${res.status}`);
      }
      responseText = data.choices?.[0]?.message?.content || '';
    }

    // Provider 4: OpenRouter
    else if (provider === 'openrouter') {
      const apiKey = Deno.env.get('OPENROUTER_API_KEY') || Deno.env.get('AI_API_KEY');
      if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY in server environment variables');

      const targetModel = model || 'deepseek/deepseek-r1';
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map((msg: { role: string; content: string }) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content: prompt }
      ];

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: targetModel,
          messages,
          temperature
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || `OpenRouter API returned error code ${res.status}`);
      }
      responseText = data.choices?.[0]?.message?.content || '';
    } else {
      throw new Error(`Unsupported AI provider: "${provider}"`);
    }

    return new Response(JSON.stringify({ text: responseText, success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI request failed';
    return new Response(JSON.stringify({ error: message, success: false }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
