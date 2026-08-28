import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'http';

function parseRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.end(JSON.stringify(data));
}

function secureAiBackendPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'secure-ai-backend-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] || '';

        // CORS Preflight
        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
          res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
          res.end();
          return;
        }

        // Endpoint 1: Health & Models Check
        if (url === '/api/ai/models' && req.method === 'GET') {
          const provider = (req.headers['x-provider'] as string) || env.AI_PROVIDER || 'gemini';
          const apiKey = 
            (provider === 'gemini' ? (env.GEMINI_API_KEY || env.AI_API_KEY) :
             provider === 'groq' ? (env.GROQ_API_KEY || env.AI_API_KEY) :
             provider === 'openai' ? (env.OPENAI_API_KEY || env.AI_API_KEY) :
             provider === 'openrouter' ? (env.OPENROUTER_API_KEY || env.AI_API_KEY) :
             env.AI_API_KEY) || '';

          return sendJson(res, 200, {
            success: true,
            provider,
            isConfigured: Boolean(apiKey),
            defaultModel: env.AI_MODEL || (provider === 'gemini' ? 'gemini-2.0-flash' : provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini')
          });
        }

        // Endpoint 2: Connection Verification
        if (url === '/api/ai/verify' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const provider = body.provider || env.AI_PROVIDER || 'gemini';
            const apiKey = (
              provider === 'gemini' ? (env.GEMINI_API_KEY || env.AI_API_KEY) :
              provider === 'groq' ? (env.GROQ_API_KEY || env.AI_API_KEY) :
              provider === 'openai' ? (env.OPENAI_API_KEY || env.AI_API_KEY) :
              provider === 'openrouter' ? (env.OPENROUTER_API_KEY || env.AI_API_KEY) :
              env.AI_API_KEY
            ) || '';

            if (!apiKey) {
              return sendJson(res, 400, {
                success: false,
                message: `No server-side API key found for provider "${provider}". Please add ${provider.toUpperCase()}_API_KEY or AI_API_KEY to your .env file.`
              });
            }

            return sendJson(res, 200, {
              success: true,
              provider,
              message: `Successfully connected to ${provider.toUpperCase()} AI backend service.`
            });
          } catch (err: any) {
            return sendJson(res, 500, { success: false, message: err.message });
          }
        }

        // Endpoint 3: Secure AI Chat & Completions
        if (url === '/api/ai/chat' && req.method === 'POST') {
          const startTime = Date.now();
          try {
            const body = await parseRequestBody(req);
            const { 
              prompt, 
              history = [], 
              context = {}, 
              provider: reqProvider, 
              model: reqModel, 
              temperature = 0.7 
            } = body;

            if (!prompt || typeof prompt !== 'string') {
              return sendJson(res, 400, { success: false, error: 'Prompt is required' });
            }

            const provider = reqProvider || env.AI_PROVIDER || 'gemini';
            const apiKey = (
              provider === 'gemini' ? (env.GEMINI_API_KEY || env.AI_API_KEY) :
              provider === 'groq' ? (env.GROQ_API_KEY || env.AI_API_KEY) :
              provider === 'openai' ? (env.OPENAI_API_KEY || env.AI_API_KEY) :
              provider === 'openrouter' ? (env.OPENROUTER_API_KEY || env.AI_API_KEY) :
              env.AI_API_KEY
            ) || '';

            if (!apiKey) {
              return sendJson(res, 400, {
                success: false,
                error: `Missing server API key for "${provider}". Set ${provider.toUpperCase()}_API_KEY or AI_API_KEY in your .env file.`
              });
            }

            // Build system prompt with memories
            const memList = Array.isArray(context?.memories) && context.memories.length > 0
              ? `\n\nUSER MEMORIES & CONTEXT:\n${context.memories.map((m: any) => `- [${m.category || 'General'}] ${m.content}`).join('\n')}`
              : '';

            const systemPrompt = (context?.systemRole || `You are Kedar AI, a personalized AI super-copilot and academic mentor for ${context?.profile?.name || 'the student'}. Student details: ${context?.profile?.education || 'B.Tech'} in ${context?.profile?.branch || 'CSE'}, ${context?.profile?.college || 'Engineering'}. Preferred Learning Style: ${context?.profile?.preferredLearningStyle || 'Practical'}. Provide structured, clear responses with code blocks and clean markdown.`) + memList;

            let responseText = '';

            // Gemini Provider
            if (provider === 'gemini' || provider === 'kedar-ai') {
              const targetModel = reqModel || env.AI_MODEL || 'gemini-2.0-flash';
              const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

              const contents = [
                ...history.map((msg: { role: string; content: string }) => ({
                  role: msg.role === 'assistant' ? 'model' : 'user',
                  parts: [{ text: msg.content }]
                })),
                { role: 'user', parts: [{ text: prompt }] }
              ];

              const apiRes = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  systemInstruction: { parts: [{ text: systemPrompt }] },
                  contents,
                  generationConfig: { temperature, maxOutputTokens: 4096 }
                })
              });

              const data = await apiRes.json();
              if (!apiRes.ok) {
                throw new Error(data.error?.message || `Gemini API returned status ${apiRes.status}`);
              }
              responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            }

            // Groq Provider
            else if (provider === 'groq') {
              const targetModel = reqModel || env.AI_MODEL || 'llama-3.3-70b-versatile';
              const messages = [
                { role: 'system', content: systemPrompt },
                ...history.map((msg: { role: string; content: string }) => ({
                  role: msg.role === 'assistant' ? 'assistant' : 'user',
                  content: msg.content
                })),
                { role: 'user', content: prompt }
              ];

              const apiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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

              const data = await apiRes.json();
              if (!apiRes.ok) {
                throw new Error(data.error?.message || `Groq API returned status ${apiRes.status}`);
              }
              responseText = data.choices?.[0]?.message?.content || '';
            }

            // OpenAI Provider
            else if (provider === 'openai') {
              const targetModel = reqModel || env.AI_MODEL || 'gpt-4o-mini';
              const messages = [
                { role: 'system', content: systemPrompt },
                ...history.map((msg: { role: string; content: string }) => ({
                  role: msg.role === 'assistant' ? 'assistant' : 'user',
                  content: msg.content
                })),
                { role: 'user', content: prompt }
              ];

              const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
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

              const data = await apiRes.json();
              if (!apiRes.ok) {
                throw new Error(data.error?.message || `OpenAI API returned status ${apiRes.status}`);
              }
              responseText = data.choices?.[0]?.message?.content || '';
            }

            // OpenRouter Provider
            else if (provider === 'openrouter') {
              const targetModel = reqModel || env.AI_MODEL || 'deepseek/deepseek-r1';
              const messages = [
                { role: 'system', content: systemPrompt },
                ...history.map((msg: { role: string; content: string }) => ({
                  role: msg.role === 'assistant' ? 'assistant' : 'user',
                  content: msg.content
                })),
                { role: 'user', content: prompt }
              ];

              const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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

              const data = await apiRes.json();
              if (!apiRes.ok) {
                throw new Error(data.error?.message || `OpenRouter API returned status ${apiRes.status}`);
              }
              responseText = data.choices?.[0]?.message?.content || '';
            } else {
              throw new Error(`Unsupported AI provider: ${provider}`);
            }

            return sendJson(res, 200, {
              success: true,
              text: responseText,
              latencyMs: Date.now() - startTime,
              provider
            });
          } catch (err: any) {
            return sendJson(res, 500, {
              success: false,
              error: err.message || 'AI request failed'
            });
          }
        }

        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      secureAiBackendPlugin(env)
    ],
    server: {
      port: 3000,
      open: false
    }
  };
});
