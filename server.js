import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

// Load environment variables from process.env
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';
const AI_MODEL = process.env.AI_MODEL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.AI_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.AI_API_KEY || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.AI_API_KEY || '';

function parseRequestBody(req) {
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

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.end(JSON.stringify(data));
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];

  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.end();
    return;
  }

  // AI API Endpoints
  if (url === '/api/ai/models' && req.method === 'GET') {
    const provider = req.headers['x-provider'] || AI_PROVIDER;
    const apiKey = (
      provider === 'gemini' ? GEMINI_API_KEY :
      provider === 'groq' ? GROQ_API_KEY :
      provider === 'openai' ? OPENAI_API_KEY :
      provider === 'openrouter' ? OPENROUTER_API_KEY : GEMINI_API_KEY
    );
    return sendJson(res, 200, {
      success: true,
      provider,
      isConfigured: Boolean(apiKey),
      defaultModel: AI_MODEL || (provider === 'gemini' ? 'gemini-2.0-flash' : provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini')
    });
  }

  if (url === '/api/ai/verify' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const provider = body.provider || AI_PROVIDER;
      const apiKey = (
        provider === 'gemini' ? GEMINI_API_KEY :
        provider === 'groq' ? GROQ_API_KEY :
        provider === 'openai' ? OPENAI_API_KEY :
        provider === 'openrouter' ? OPENROUTER_API_KEY : GEMINI_API_KEY
      );
      if (!apiKey) {
        return sendJson(res, 400, {
          success: false,
          message: `Server missing ${provider.toUpperCase()}_API_KEY.`
        });
      }
      return sendJson(res, 200, {
        success: true,
        provider,
        message: `Successfully connected to ${provider.toUpperCase()} AI backend service.`
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, message: err.message });
    }
  }

  if (url === '/api/ai/chat' && req.method === 'POST') {
    const startTime = Date.now();
    try {
      const body = await parseRequestBody(req);
      const { prompt, history = [], context = {}, provider: reqProvider, model: reqModel, temperature = 0.7 } = body;

      if (!prompt || typeof prompt !== 'string') {
        return sendJson(res, 400, { success: false, error: 'Prompt is required' });
      }

      const provider = reqProvider || AI_PROVIDER;
      const apiKey = (
        provider === 'gemini' ? GEMINI_API_KEY :
        provider === 'groq' ? GROQ_API_KEY :
        provider === 'openai' ? OPENAI_API_KEY :
        provider === 'openrouter' ? OPENROUTER_API_KEY : GEMINI_API_KEY
      );

      if (!apiKey) {
        return sendJson(res, 400, {
          success: false,
          error: `Missing server API key for "${provider}". Set ${provider.toUpperCase()}_API_KEY in server environment.`
        });
      }

      const memList = Array.isArray(context?.memories) && context.memories.length > 0
        ? `\n\nUSER MEMORIES & CONTEXT:\n${context.memories.map((m) => `- [${m.category || 'General'}] ${m.content}`).join('\n')}`
        : '';

      const systemPrompt = (context?.systemRole || `You are Kedar AI, a personalized AI super-copilot and academic mentor for ${context?.profile?.name || 'the student'}.`) + memList;

      let responseText = '';

      if (provider === 'gemini' || provider === 'kedar-ai') {
        const targetModel = reqModel || AI_MODEL || 'gemini-2.0-flash';
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
        const contents = [
          ...history.map((msg) => ({
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
        if (!apiRes.ok) throw new Error(data.error?.message || `Gemini error ${apiRes.status}`);
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else if (provider === 'groq') {
        const targetModel = reqModel || AI_MODEL || 'llama-3.3-70b-versatile';
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.map((msg) => ({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content })),
          { role: 'user', content: prompt }
        ];
        const apiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({ model: targetModel, messages, temperature, max_tokens: 4096 })
        });
        const data = await apiRes.json();
        if (!apiRes.ok) throw new Error(data.error?.message || `Groq error ${apiRes.status}`);
        responseText = data.choices?.[0]?.message?.content || '';
      } else if (provider === 'openai') {
        const targetModel = reqModel || AI_MODEL || 'gpt-4o-mini';
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.map((msg) => ({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content })),
          { role: 'user', content: prompt }
        ];
        const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({ model: targetModel, messages, temperature })
        });
        const data = await apiRes.json();
        if (!apiRes.ok) throw new Error(data.error?.message || `OpenAI error ${apiRes.status}`);
        responseText = data.choices?.[0]?.message?.content || '';
      } else if (provider === 'openrouter') {
        const targetModel = reqModel || AI_MODEL || 'deepseek/deepseek-r1';
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.map((msg) => ({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content })),
          { role: 'user', content: prompt }
        ];
        const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({ model: targetModel, messages, temperature })
        });
        const data = await apiRes.json();
        if (!apiRes.ok) throw new Error(data.error?.message || `OpenRouter error ${apiRes.status}`);
        responseText = data.choices?.[0]?.message?.content || '';
      }

      return sendJson(res, 200, {
        success: true,
        text: responseText,
        latencyMs: Date.now() - startTime,
        provider
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message || 'AI request failed' });
    }
  }

  // Static File Serving for Production
  let filePath = path.join(DIST_DIR, url === '/' ? 'index.html' : url);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Kedar AI production server running at http://localhost:${PORT}`);
});
