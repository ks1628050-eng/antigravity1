import { UserProfile, MemoryItem, AISettings, ResumeAnalysis, AIProvider, BusinessIdea } from '../types';
import { backendService } from './backendService';

export interface AIRequestContext {
  profile: UserProfile;
  memories: MemoryItem[];
  settings: AISettings;
  systemRole?: string;
  category?: string;
}

/**
 * Get active API key for a provider from settings or Vite environment variables
 */
export function getApiKey(provider: AIProvider, settings?: AISettings): string {
  const env = (import.meta as any).env || {};
  if (provider === 'gemini') {
    return (settings?.geminiApiKey || env.VITE_GEMINI_API_KEY || '').trim();
  }
  if (provider === 'groq') {
    return (settings?.groqApiKey || env.VITE_GROQ_API_KEY || '').trim();
  }
  if (provider === 'openai') {
    return (settings?.openaiApiKey || env.VITE_OPENAI_API_KEY || '').trim();
  }
  if (provider === 'openrouter') {
    return (settings?.openrouterApiKey || env.VITE_OPENROUTER_API_KEY || '').trim();
  }
  return '';
}

/**
 * Build personalized system prompt injecting student profile and stored memories
 */
export function buildSystemPrompt(context: AIRequestContext): string {
  const { profile, memories, settings, systemRole } = context;
  const memContext = memories.length > 0 
    ? `\n\nUSER MEMORIES & STORED CONTEXT:\n${memories.map(m => `- [${m.category.toUpperCase()}] ${m.content}`).join('\n')}`
    : '';

  const defaultRole = `You are Kedar AI, an elite autonomous AI super-copilot and academic mentor designed for engineering students, developers, and builders.
You assist ${profile.name}, a ${profile.education} student in ${profile.branch} at ${profile.college} (${profile.currentSemester}), aiming for ${profile.targetRole}.
Key Technical Stack: ${profile.skills.join(', ')}.
Current Active Projects: ${profile.currentProjects.join(', ')}.
Preferred Learning Style: ${profile.preferredLearningStyle}.
Goals: ${profile.longTermGoals.join('; ')}.

Guidelines:
1. Provide production-grade, highly structured, syntactically correct code (TypeScript, Python, C++, SQL, React) with clear explanations.
2. For university exam queries (VTU/JNTU/SPPU formats), generate standard 2-mark or 10-mark answers with ASCII block diagrams, step-by-step math derivations, and scoring rubrics.
3. For viva voce and mock interviews, give rigorous, professional feedback with score out of 10 and keyword checks.
4. Format all responses with clean Markdown, bold headers, and syntax-highlighted code fences.`;

  return (systemRole || settings.customSystemPrompt || defaultRole) + memContext;
}

export const aiService = {
  /**
   * Fetch real live available models from provider API
   */
  fetchAvailableModels: async (
    provider: AIProvider,
    apiKey: string
  ): Promise<{ success: boolean; models: string[]; message?: string }> => {
    if (!apiKey) {
      return { success: false, models: [], message: 'Please provide an API key first.' };
    }

    try {
      if (provider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error?.message || `HTTP ${res.status}`);
        }
        const data = await res.json();
        const models = (data.models || [])
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m: any) => m.name.replace('models/', ''));
        return { success: true, models: models.length > 0 ? models : ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'] };
      }

      if (provider === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error?.message || `HTTP ${res.status}`);
        }
        const data = await res.json();
        const models = (data.data || []).map((m: any) => m.id);
        return { success: true, models: models.length > 0 ? models : ['llama-3.1-8b-instant', 'llama3-70b-8192', 'llama3-8b-8192', 'gemma2-9b-it', 'gpt-oss-120b'] };
      }

      if (provider === 'openrouter') {
        const res = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error?.message || `HTTP ${res.status}`);
        }
        const data = await res.json();
        const models = (data.data || []).slice(0, 40).map((m: any) => m.id);
        return { success: true, models: models.length > 0 ? models : ['deepseek/deepseek-r1', 'deepseek/deepseek-chat', 'meta-llama/llama-3.3-70b-instruct', 'meta-llama/llama-3.2-3b-instruct:free'] };
      }

      if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error?.message || `HTTP ${res.status}`);
        }
        const data = await res.json();
        const models = (data.data || [])
          .map((m: any) => m.id)
          .filter((id: string) => id.includes('gpt') || id.includes('o1') || id.includes('o3'));
        return { success: true, models: models.length > 0 ? models : ['gpt-4o', 'gpt-4o-mini', 'o3-mini'] };
      }

      return { success: false, models: [], message: 'No live model list available for this provider.' };
    } catch (err: any) {
      return { success: false, models: [], message: err.message || 'Failed to fetch live model catalog.' };
    }
  },

  /**
   * Test an API Key connection with a fast verification ping and auto-recovery
   */
  testAPIConnection: async (
    provider: AIProvider,
    apiKey: string,
    model?: string
  ): Promise<{ success: boolean; message: string; latencyMs: number; activeModel?: string }> => {
    const start = Date.now();
    const testPrompt = 'Respond with exact word "OK" only.';

    try {
      if (provider === 'gemini') {
        // Modern model candidates
        let targetModel = model && model !== 'gemini-2.0-flash' ? model : 'gemini-2.5-flash';
        const testCandidates = [targetModel, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
        
        let lastError = '';
        for (const candidate of testCandidates) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${candidate}:generateContent?key=${apiKey}`;
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: testPrompt }] }],
                generationConfig: { maxOutputTokens: 10 }
              })
            });
            if (res.ok) {
              return { success: true, message: `Connected to Google Gemini (${candidate})`, latencyMs: Date.now() - start, activeModel: candidate };
            }
            const errData = await res.json().catch(() => ({}));
            lastError = errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          } catch (e: any) {
            lastError = e.message;
          }
        }
        throw new Error(lastError || 'Failed to connect to Google Gemini models.');
      }

      if (provider === 'groq') {
        let targetModel = model && model !== 'llama-3.3-70b-versatile' ? model : 'llama-3.1-8b-instant';
        const testCandidates = [targetModel, 'llama-3.1-8b-instant', 'llama3-70b-8192', 'llama3-8b-8192', 'gemma2-9b-it'];
        
        let lastError = '';
        for (const candidate of testCandidates) {
          try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                model: candidate,
                messages: [{ role: 'user', content: testPrompt }],
                max_tokens: 10
              })
            });
            if (res.ok) {
              return { success: true, message: `Connected to Groq Cloud (${candidate})`, latencyMs: Date.now() - start, activeModel: candidate };
            }
            const errData = await res.json().catch(() => ({}));
            lastError = errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          } catch (e: any) {
            lastError = e.message;
          }
        }
        throw new Error(lastError || 'Failed to connect to Groq models.');
      }

      if (provider === 'openai') {
        const targetModel = model || 'gpt-4o-mini';
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [{ role: 'user', content: testPrompt }],
            max_tokens: 10
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          if (errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('billing')) {
            throw new Error(`OpenAI API quota exceeded (check your billing plan). Tip: Google Gemini & Groq provide 100% free API keys!`);
          }
          throw new Error(errMsg);
        }
        return { success: true, message: `Connected to OpenAI (${targetModel})`, latencyMs: Date.now() - start, activeModel: targetModel };
      }

      if (provider === 'openrouter') {
        let targetModel = model || 'deepseek/deepseek-r1';
        const testCandidates = [targetModel, 'deepseek/deepseek-r1', 'deepseek/deepseek-chat', 'meta-llama/llama-3.2-3b-instruct:free'];
        
        let lastError = '';
        for (const candidate of testCandidates) {
          try {
            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                model: candidate,
                messages: [{ role: 'user', content: testPrompt }],
                max_tokens: 10
              })
            });
            if (res.ok) {
              return { success: true, message: `Connected to OpenRouter (${candidate})`, latencyMs: Date.now() - start, activeModel: candidate };
            }
            const errData = await res.json().catch(() => ({}));
            lastError = errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          } catch (e: any) {
            lastError = e.message;
          }
        }
        throw new Error(lastError || 'Failed to connect to OpenRouter.');
      }

      return { success: true, message: 'Smart Offline Brain is active.', latencyMs: 5, activeModel: 'smart-offline-brain' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Connection failed', latencyMs: Date.now() - start };
    }
  },

  /**
   * Main chat completion with real streaming token support
   */
  generateChatResponse: async (
    prompt: string,
    history: { role: 'user' | 'assistant'; content: string }[],
    context: AIRequestContext,
    onChunk?: (chunk: string) => void
  ): Promise<string> => {
    const { settings } = context;
    const provider = settings.provider || 'gemini';
    const apiKey = getApiKey(provider, settings);

    // 1. Direct Google Gemini REST API (with SSE streaming)
    if (provider === 'gemini' && apiKey) {
      try {
        return await streamGemini(prompt, history, context, apiKey, onChunk);
      } catch (err: any) {
        console.warn('Gemini API call failed, attempting fallback:', err);
        if (onChunk) onChunk(`⚠️ [Gemini notice: ${err.message} — Switching to smart fallback]\n\n`);
      }
    }

    // 2. Direct Groq API (Ultra-Fast Llama 3.3 70B / DeepSeek R1)
    if (provider === 'groq' && apiKey) {
      try {
        return await streamOpenAICompatible('https://api.groq.com/openai/v1/chat/completions', apiKey, settings.model || 'llama-3.3-70b-versatile', prompt, history, context, onChunk);
      } catch (err: any) {
        console.warn('Groq API call failed:', err);
      }
    }

    // 3. Direct OpenAI API (GPT-4o / GPT-4o-mini / o3-mini)
    if (provider === 'openai' && apiKey) {
      try {
        return await streamOpenAICompatible('https://api.openai.com/v1/chat/completions', apiKey, settings.model || 'gpt-4o-mini', prompt, history, context, onChunk);
      } catch (err: any) {
        console.warn('OpenAI API call failed:', err);
      }
    }

    // 4. Direct OpenRouter API (DeepSeek-R1 / Claude 3.5 Sonnet)
    if (provider === 'openrouter' && apiKey) {
      try {
        return await streamOpenAICompatible('https://openrouter.ai/api/v1/chat/completions', apiKey, settings.model || 'deepseek/deepseek-r1', prompt, history, context, onChunk);
      } catch (err: any) {
        console.warn('OpenRouter API call failed:', err);
      }
    }

    // 5. Supabase Edge Function (if chosen)
    if (provider === 'supabase' && backendService.isConfigured) {
      try {
        const result = await backendService.invokeAI({ prompt, history, context, provider: 'gemini', model: settings.model, temperature: settings.temperature });
        if (result?.text) {
          if (onChunk) await simulateTokenStream(result.text, onChunk);
          return result.text;
        }
      } catch (err: any) {
        console.warn('Supabase AI call failed:', err);
      }
    }

    // 6. Smart Built-in Offline Brain (Instant, zero cost, resilient fallback)
    return await generateSmartMockResponse(prompt, history, context, onChunk);
  },

  /**
   * Resume Analyzer Engine with real LLM evaluation
   */
  analyzeResume: async (
    resumeText: string,
    targetRole: string,
    context?: AIRequestContext
  ): Promise<ResumeAnalysis> => {
    const prompt = `Act as a Tier-1 Silicon Valley Technical Recruiter and ATS Algorithm.
Audit the following resume targeting the role: "${targetRole || 'Full Stack AI Engineer'}".

Resume Text:
"""
${resumeText}
"""

You MUST respond strictly with a valid JSON object without any markdown wrapping or backticks. Format:
{
  "overallScore": <number between 40 and 95>,
  "summary": "<2 sentence executive verdict>",
  "detectedSkills": ["<skill1>", "<skill2>", ...],
  "missingSkills": ["<critical missing skill 1>", "<critical missing skill 2>", ...],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weakSections": ["<weakness 1>", "<weakness 2>"],
  "improvementSuggestions": ["<actionable advice 1>", "<actionable advice 2>", "<actionable advice 3>"],
  "rewrittenBullets": [
    {
      "before": "<a weak line from the resume>",
      "after": "<rewritten line using Google XYZ formula: Accomplished [X] measured by [Y] by doing [Z]>",
      "reason": "<why this improves ATS score>"
    },
    {
      "before": "<another weak bullet from the resume>",
      "after": "<rewritten bullet with metrics and technical depth>",
      "reason": "<why this converts recruiters>"
    }
  ]
}`;

    if (context) {
      try {
        const rawJson = await aiService.generateChatResponse(prompt, [], { ...context, systemRole: 'You are an ATS resume parsing API that outputs strictly valid JSON without explanation.' });
        const cleanJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.overallScore && parsed.summary) {
          return {
            id: `resume-${Date.now()}`,
            overallScore: Math.min(98, Math.max(45, parsed.overallScore)),
            summary: parsed.summary,
            detectedSkills: parsed.detectedSkills || [],
            missingSkills: parsed.missingSkills || [],
            strengths: parsed.strengths || [],
            weakSections: parsed.weakSections || [],
            improvementSuggestions: parsed.improvementSuggestions || [],
            rewrittenBullets: parsed.rewrittenBullets || [],
            createdAt: new Date().toISOString()
          };
        }
      } catch (e) {
        console.warn('LLM resume JSON parse fallback:', e);
      }
    }

    // Dynamic intelligent fallback based on text content
    let score = 72;
    const lower = resumeText.toLowerCase();
    const techKeywords = ['react', 'next.js', 'typescript', 'python', 'fastapi', 'c++', 'sql', 'postgresql', 'docker', 'git', 'api', 'aws', 'rest', 'tailwind', 'algorithms', 'data structures', 'gemini', 'langchain'];
    const matchedSkills = techKeywords.filter(keyword => lower.includes(keyword));
    const missingSkills = ['Redis / Distributed Caching', 'CI/CD Pipelines (GitHub Actions)', 'System Design / Microservices', 'Unit & Integration Testing (Jest/Vitest)', 'Docker Containerization & Kubernetes'].filter(skill => !lower.includes(skill.toLowerCase().split(' ')[0]));
    if (matchedSkills.length > 5) score += 12;
    if (lower.includes('metric') || lower.includes('%') || lower.includes('increased') || lower.includes('reduced') || lower.includes('ms') || lower.includes('latency')) score += 8;
    score = Math.min(score, 94);

    return {
      id: `resume-${Date.now()}`,
      overallScore: score,
      summary: `Your resume shows strong foundational engineering and hands-on project experience for a **${targetRole || 'Full Stack / AI Engineer'}** role. Adding quantitative metrics will boost ATS ranking into the 90th percentile.`,
      detectedSkills: matchedSkills.map(skill => skill.toUpperCase()),
      missingSkills: missingSkills.slice(0, 4),
      strengths: [
        'Solid modern web development stack (React, TypeScript, Backend APIs)',
        'Hands-on project experience solving practical engineering problems',
        'Strong problem-solving foundation in data structures & algorithms',
        'Clean section hierarchy suitable for automated ATS parsing'
      ],
      weakSections: [
        'Project bullet points need measurable quantitative business impact (e.g. % faster, ms latency, # of users).',
        'Production testing (Vitest/Jest) and automated CI/CD are not prominently highlighted.'
      ],
      improvementSuggestions: [
        'Apply the Google XYZ Formula: "Accomplished [X] as measured by [Y], by doing [Z]" to every project bullet.',
        'Categorize technical skills into Languages, Frameworks, Databases, and Developer Tools.',
        'Include live deployed URL links and GitHub repository badges for each project.'
      ],
      rewrittenBullets: [
        {
          before: 'Built an AI assistant web app using React and Gemini API.',
          after: 'Architected and deployed a multi-tenant AI copilot with React 19 and TypeScript, reducing client-side response latency by 45% using Server-Sent Events token streaming.',
          reason: 'Quantifies technical ownership, architectural decisions, and measurable latency reduction.'
        },
        {
          before: 'Worked on database queries and backend APIs.',
          after: 'Engineered high-throughput REST endpoints and optimized PostgreSQL queries with composite indexing, reducing P95 database query latency from 320ms to 85ms.',
          reason: 'Demonstrates backend depth, database tuning, and real performance metrics.'
        }
      ],
      createdAt: new Date().toISOString()
    };
  },

  /**
   * Plan My Day Engine with real LLM synthesis
   */
  generateDailySchedule: async (
    tasks: any[],
    context: AIRequestContext
  ): Promise<string> => {
    const pendingHigh = tasks.filter(t => !t.isCompleted && t.priority === 'high');
    const pendingMed = tasks.filter(t => !t.isCompleted && t.priority === 'medium');

    const prompt = `Synthesize an optimal, time-blocked Daily Productive Schedule for ${context.profile.name}.
Active Tasks on Board:
${tasks.map(t => `- [${t.priority.toUpperCase()}] ${t.title} (${t.category}) - Deadline: ${t.deadline} - Completed: ${t.isCompleted}`).join('\n')}

Format as a high-yield timetable with time slots from 08:30 AM to 09:30 PM, Deep Work Blocks, Active Rest, and a key productivity principle.`;

    try {
      const schedule = await aiService.generateChatResponse(prompt, [], context);
      if (schedule && schedule.length > 100) return schedule;
    } catch (e) {
      console.warn('LLM schedule fallback:', e);
    }

    return `### 📅 Optimized Daily Schedule for ${context.profile.name.split(' ')[0]}

**Focus Philosophy**: Deep Work Block in the morning for high-leverage coding & algorithmic mastery, followed by academic submissions and career networking in the afternoon.

---

| Time Slot | Phase | Action Item | Priority |
|---|---|---|---|
| **08:30 AM – 09:00 AM** | 🌅 Morning Setup | Review day goals, check GitHub notifications & coffee | Routine |
| **09:00 AM – 11:30 AM** | 🔥 Deep Work Block 1 | ${pendingHigh[0]?.title || 'Solve 3 LeetCode Mediums (DP / Graphs)'} | **High** |
| **11:30 AM – 11:45 AM** | ☕ Active Rest | Hydrate, stretch, eye relaxation | Health |
| **11:45 AM – 01:15 PM** | 💻 Deep Work Block 2 | ${pendingHigh[1]?.title || 'Work on Kedar AI Feature Development & Refactoring'} | **High** |
| **01:15 PM – 02:15 PM** | 🥗 Lunch & Recharge | Relax, listen to tech podcasts / tech news | Routine |
| **02:15 PM – 03:45 PM** | 📚 College & Academics | ${pendingMed[0]?.title || 'Complete OS / DBMS Assignment & Lab Record'} | Medium |
| **03:45 PM – 05:00 PM** | 🚀 Career & Portfolio | Update Resume metrics, engage on LinkedIn, review job postings | High |
| **05:00 PM – 06:00 PM** | ⚡ Workout / Walk | Physical activity & recharge | Vital |
| **06:30 PM – 08:00 PM** | 🧠 Learning & Upskilling | GenAI / RAG embeddings practice / System Design video | Medium |
| **09:00 PM – 09:30 PM** | 🌙 Daily Retrospective | Check off completed tasks in Kedar AI & plan tomorrow | Habit |

---

> 🎯 **AI Productivity Tip**: *"Protect the 9:00 AM to 11:30 AM slot from all distractions. That single 2.5-hour block will compound your engineering skills 10x faster than fragmented study hours."*`;
  },

  /**
   * Business Idea Generator with structured LLM synthesis
   */
  generateBusinessIdea: async (
    skills: string,
    industry: string,
    context: AIRequestContext
  ): Promise<BusinessIdea> => {
    const prompt = `Synthesize a realistic, high-margin B2B Micro-SaaS startup idea for a developer with skills: "${skills}". Target industry: "${industry}".
Output strictly a JSON object with this format:
{
  "title": "<Idea Name and Tagline>",
  "tagline": "<Short 1-sentence value hook>",
  "problem": "<2-sentence sharp problem statement>",
  "solution": "<2-sentence solution and unfair advantage>",
  "targetAudience": "<target buyers/users>",
  "techStack": ["<tech1>", "<tech2>", "<tech3>", "<tech4>", "<tech5>"],
  "monetization": ["<Free Starter>", "<Pro Tier: $X/mo>", "<Enterprise: $Y/mo>"],
  "mvpPlan": [
    { "week": 1, "goal": "<Week 1 milestone>", "tasks": ["<task 1>", "<task 2>"] },
    { "week": 2, "goal": "<Week 2 milestone>", "tasks": ["<task 1>", "<task 2>"] },
    { "week": 3, "goal": "<Week 3 milestone>", "tasks": ["<task 1>", "<task 2>"] },
    { "week": 4, "goal": "<Week 4 milestone>", "tasks": ["<task 1>", "<task 2>"] }
  ],
  "goToAction": ["<GTM step 1>", "<GTM step 2>", "<GTM step 3>"]
}`;

    try {
      const rawJson = await aiService.generateChatResponse(prompt, [], { ...context, systemRole: 'You are a startup venture architect that outputs strictly valid JSON without explanation.' });
      const cleanJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.title && parsed.solution) {
        return {
          id: `biz-${Date.now()}`,
          title: parsed.title,
          tagline: parsed.tagline || '',
          problem: parsed.problem || '',
          solution: parsed.solution || '',
          targetAudience: parsed.targetAudience || '',
          techStack: parsed.techStack || ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'FastAPI', 'PostgreSQL'],
          monetization: parsed.monetization || ['Free Starter', 'Pro: $29/mo', 'Team: $99/mo'],
          mvpPlan: parsed.mvpPlan || [],
          goToAction: parsed.goToAction || [],
          createdAt: new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn('Business idea LLM parse fallback:', e);
    }

    return {
      id: `biz-${Date.now()}`,
      title: 'DocuMind AI — Real-time API Documentation & Test Engine',
      tagline: 'Automatically generates interactive API playground and Postman collections from code repositories.',
      problem: 'Engineering teams waste 15+ hours per sprint keeping OpenAPI specs and Swagger docs in sync with rapidly evolving backend routes.',
      solution: 'A GitHub bot that watches PRs and auto-generates live interactive documentation pages and automated endpoint regression tests.',
      targetAudience: 'Fast-growing SaaS startups, API-first companies, and development agencies.',
      techStack: ['Next.js 15', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Docker', 'Stripe'],
      monetization: [
        'Free Starter: Up to 3 API endpoints',
        'Pro Tier: $39/month (unlimited endpoints & team sync)',
        'Enterprise: $299/month (custom domain, SSO, SLA)'
      ],
      mvpPlan: [
        { week: 1, goal: 'AST Route Extractor', tasks: ['Parse FastAPI and Express routes using Tree-sitter', 'Build JSON schema exporter'] },
        { week: 2, goal: 'Interactive UI Playground', tasks: ['Build clean Swagger/GraphQL-like viewer with dark mode', 'Enable direct API testing'] },
        { week: 3, goal: 'GitHub Webhook Sync', tasks: ['Listen to push events', 'Auto-update documentation branches'] },
        { week: 4, goal: 'Stripe Billing & Launch', tasks: ['Launch on Product Hunt, Hacker News, and Indie Hackers'] }
      ],
      goToAction: [
        'Build an open-source CLI that generates docs in terminal',
        'Post demo video on X and LinkedIn showcasing instant API doc generation',
        'Offer free lifetime Pro licenses to first 20 beta testers'
      ],
      createdAt: new Date().toISOString()
    };
  }
};

/**
 * Stream Google Gemini API with SSE chunk decoder
 */
/**
 * Stream Google Gemini API with SSE chunk decoder and auto-model recovery
 */
async function streamGemini(
  prompt: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  context: AIRequestContext,
  apiKey: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  let model = context.settings.model || 'gemini-2.5-flash';
  if (model === 'gemini-2.0-flash') {
    model = 'gemini-2.5-flash';
  }
  const systemPrompt = buildSystemPrompt(context);

  const contents = [
    ...history.slice(-8).map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    })),
    {
      role: 'user',
      parts: [{ text: prompt }]
    }
  ];

  const tryCall = async (targetModel: string) => {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:streamGenerateContent?key=${apiKey}&alt=sse`;
    return await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: context.settings.temperature ?? 0.7,
          maxOutputTokens: 8192
        }
      })
    });
  };

  let response = await tryCall(model);

  // Auto-recovery if model is deprecated or not found
  if (!response.ok) {
    const fallbackModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'].filter(m => m !== model);
    for (const fb of fallbackModels) {
      const fbRes = await tryCall(fb);
      if (fbRes.ok) {
        response = fbRes;
        break;
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Gemini API Error ${response.status}: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('ReadableStream not supported by browser.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;
      const jsonStr = trimmed.replace(/^data:\s*/, '');
      if (jsonStr === '[DONE]') continue;

      try {
        const parsed = JSON.parse(jsonStr);
        const chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (chunkText) {
          fullText += chunkText;
          if (onChunk) onChunk(fullText);
        }
      } catch {
        // partial chunk ignore
      }
    }
  }

  return fullText || 'No response received from Gemini.';
}

/**
 * Stream OpenAI-compatible endpoints (Groq, OpenAI, OpenRouter) with auto-model fallback
 */
async function streamOpenAICompatible(
  url: string,
  apiKey: string,
  model: string,
  prompt: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  context: AIRequestContext,
  onChunk?: (chunk: string) => void
): Promise<string> {
  let targetModel = model;
  if (url.includes('groq.com') && targetModel === 'llama-3.3-70b-versatile') {
    targetModel = 'llama-3.1-8b-instant';
  }

  const systemPrompt = buildSystemPrompt(context);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-8).map(h => ({
      role: h.role,
      content: h.content
    })),
    { role: 'user', content: prompt }
  ];

  const tryCall = async (m: string) => {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: m,
        messages,
        temperature: context.settings.temperature ?? 0.7,
        stream: true
      })
    });
  };

  let response = await tryCall(targetModel);

  // If Groq model failed, auto-fallback to active Groq models
  if (!response.ok && url.includes('groq.com')) {
    const groqFallbacks = ['llama-3.1-8b-instant', 'llama3-70b-8192', 'llama3-8b-8192', 'gemma2-9b-it'].filter(m => m !== targetModel);
    for (const fb of groqFallbacks) {
      const fbRes = await tryCall(fb);
      if (fbRes.ok) {
        response = fbRes;
        break;
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `LLM API Error ${response.status}: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('ReadableStream not supported by browser.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;
      const jsonStr = trimmed.replace(/^data:\s*/, '');
      if (jsonStr === '[DONE]') continue;

      try {
        const parsed = JSON.parse(jsonStr);
        const delta = parsed.choices?.[0]?.delta?.content || '';
        if (delta) {
          fullText += delta;
          if (onChunk) onChunk(fullText);
        }
      } catch {
        // partial chunk ignore
      }
    }
  }

  return fullText || 'No response received from model.';
}

/**
 * Simulate word-by-word streaming for smooth visual rendering
 */
async function simulateTokenStream(fullText: string, onChunk: (chunk: string) => void): Promise<void> {
  const words = fullText.split(' ');
  let current = '';
  for (let index = 0; index < words.length; index++) {
    current += (index === 0 ? '' : ' ') + words[index];
    onChunk(current);
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}

/**
 * Smart Built-in Offline Brain (High-quality contextual responses)
 */
async function generateSmartMockResponse(
  prompt: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  context: AIRequestContext,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const { profile } = context;
  const lower = prompt.toLowerCase();

  let response = '';

  // 1. Learning & Roadmaps
  if (lower.includes('learn next') || lower.includes('what to learn') || lower.includes('study plan') || lower.includes('roadmap')) {
    response = `Hey ${profile.name.split(' ')[0]}! Based on your profile as a **${profile.education}** student aiming for **${profile.targetRole}**, and your active skills in **${profile.skills.slice(0, 5).join(', ')}**, here is your personalized next learning milestone:

### 🎯 High-Impact Learning Recommendations:

1. **Autonomous AI Agents & Function Calling (LangChain / Gemini 2.0 / ReAct)**:
   - Since you already know React and Python, bridging them with autonomous multi-step tool calling will put you in the top 1% of student developers.
   - **Key Concepts**: ReAct prompt loop, Vector Embeddings with ChromaDB, Streaming responses over Server-Sent Events.

2. **System Design & Distributed Caching (Redis + PostgreSQL)**:
   - For SDE-1 interviews, master rate limiting (Token Bucket), horizontal database sharding, and optimistic locking.

3. **Advanced DSA (Graphs & Dynamic Programming)**:
   - Continue solving 2-3 LeetCode Mediums daily focusing on Dijkstra, Topological Sort, and DP on Trees.

\`\`\`typescript
// Agent Tool Calling Schema Example
export const agentToolDefinition = {
  name: "execute_code_sandbox",
  description: "Executes TypeScript/Python code in a secure sandboxed WebAssembly runtime.",
  parameters: {
    type: "object",
    properties: {
      language: { type: "string", enum: ["typescript", "python", "sql"] },
      code: { type: "string", description: "Source code to execute" }
    },
    required: ["language", "code"]
  }
};
\`\`\`

Would you like me to generate a 4-week day-by-day roadmap or start an interactive quiz on any of these topics?`;
  }
  // 2. React / Frontend Questions
  else if (lower.includes('react') || lower.includes('next') || lower.includes('frontend') || lower.includes('hook') || lower.includes('state')) {
    response = `Here is the modern, best-practice breakdown for **React 19 & Next.js 15**:

### ⚡ React 19 Core Paradigm Shift:
React 19 introduces native **Actions**, \`useActionState\`, \`useOptimistic\`, and the \`use()\` hook for reading promises and contexts directly inside components.

\`\`\`tsx
import React, { useActionState, useOptimistic } from 'react';

// Example: Modern Optimistic Comment Submission
export function CommentSection({ initialComments }: { initialComments: string[] }) {
  const [optimisticComments, setOptimisticComments] = useOptimistic(
    initialComments,
    (state, newComment: string) => [...state, \`\${newComment} (sending...)\`]
  );

  const [state, formAction, isPending] = useActionState(
    async (previousState: any, formData: FormData) => {
      const comment = formData.get('comment') as string;
      setOptimisticComments(comment); // Instant UI update
      await postCommentToAPI(comment);
      return { success: true };
    },
    null
  );

  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white">
      <h3 className="font-semibold text-lg mb-3">Community Comments</h3>
      <ul className="space-y-2 mb-4">
        {optimisticComments.map((c, i) => (
          <li key={i} className="p-2 rounded bg-slate-800/60 text-sm">{c}</li>
        ))}
      </ul>
      <form action={formAction} className="flex gap-2">
        <input 
          name="comment" 
          placeholder="Write your thought..." 
          className="flex-1 px-3 py-2 rounded bg-slate-950 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500"
          required 
        />
        <button 
          disabled={isPending} 
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 font-medium text-sm disabled:opacity-50"
        >
          {isPending ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}
\`\`\`

### 📊 Complexity & Performance:
- **Render Complexity**: $O(1)$ per state transition.
- **Memory Footprint**: Extremely light due to automatic compiler tree-shaking.`;
  }
  // 3. DSA & Coding Questions
  else if (lower.includes('dsa') || lower.includes('algorithm') || lower.includes('complexity') || lower.includes('dp') || lower.includes('tree') || lower.includes('graph') || lower.includes('c++')) {
    response = `Let's break down this **Data Structures & Algorithms** problem with optimal time and space complexity!

### 💡 Optimal Approach & Intuition:
1. **Key Pattern**: Recognize whether this requires **Two Pointers**, **Sliding Window**, **Monotonic Stack**, or **Dynamic Programming**.
2. **State Transition**: Define sub-problems clearly: $DP[i][j]$ representing the optimal cost for prefix $i$ and budget $j$.

\`\`\`cpp
#include <iostream>
#include <vector>
#include <algorithm>

// Optimal 0/1 Knapsack Solution (Space Optimized)
int knapsackOptimal(int W, const std::vector<int>& weights, const std::vector<int>& values) {
    int n = weights.size();
    std::vector<int> dp(W + 1, 0);

    for (int i = 0; i < n; ++i) {
        for (int w = W; w >= weights[i]; --w) {
            dp[w] = std::max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }
    return dp[W];
}

int main() {
    std::vector<int> weights = {2, 3, 4, 5};
    std::vector<int> values = {3, 4, 5, 6};
    int maxCapacity = 5;

    std::cout << "Max Knapsack Profit: " << knapsackOptimal(maxCapacity, weights, values) << std::endl;
    return 0;
}
\`\`\`

### ⏱️ Complexity Analysis:
- **Time Complexity**: $O(N \\times W)$ where $N$ is number of items and $W$ is maximum capacity.
- **Space Complexity**: $O(W)$ using a single 1D rolling array instead of a 2D $O(N \\times W)$ matrix.`;
  }
  // 4. University Exam / 10-Mark Question
  else if (lower.includes('university') || lower.includes('exam') || lower.includes('10-mark') || lower.includes('derive') || lower.includes('vtu') || lower.includes('jntu')) {
    response = `## 🎓 10-MARK UNIVERSITY EXAMINATION SOLUTION

**Course:** B.Tech Computer Science & Engineering  
**Pattern:** VTU / JNTU / SPPU / Autonomous Semester Examination Standards

---

### 1. DEFINITION & CORE PRINCIPLE
A **Virtual Memory System** is a memory management capability of an OS that uses hardware and software to allow a computer to compensate for physical memory shortages by temporarily transferring data from random access memory (RAM) to disk storage.

### 2. ARCHITECTURAL BLOCK DIAGRAM
\`\`\`
+-----------------------+
|  CPU Logical Address  | ---> [ Page Number (p) | Offset (d) ]
+-----------------------+                      |
          |                                    |
          v                                    v
+-------------------+             +-----------------------+
|    Page Table     | ----------> | Physical Frame Number | + Offset (d)
+-------------------+             +-----------------------+
          |                                    |
     [Valid Bit = 0]                           v
          |                       +-----------------------+
          v                       |   Physical RAM (DRAM) |
    PAGE FAULT TRAP               +-----------------------+
          |                                    ^
          +----> OS Handler -> Fetch Disk Page +
\`\`\`

### 3. STEP-BY-STEP PAGE FAULT HANDLING SEQUENCE
1. **Trap to Operating System**: Hardware references page table; if valid-invalid bit is 0, CPU raises an internal interrupt (Page Fault Trap).
2. **Save Process State**: CPU registers and process state are pushed to the Process Control Block (PCB).
3. **Validate Memory Access**: OS checks internal tables to verify if memory reference is legitimate or illegal segmentation fault.
4. **Locate Disk Frame**: OS finds free frame on backing store (Swap space).
5. **Issue Disk I/O**: Read required page from disk into assigned physical RAM frame.
6. **Update Page Table**: Set valid bit to 1 and update physical frame number.
7. **Restart Faulted Instruction**: Restore process registers and resume user execution seamlessly.

### 4. KEY FORMULAS & EFFECTIVE ACCESS TIME (EAT)
$$\\text{EAT} = (1 - p) \\times \\text{Memory Access Time} + p \\times \\text{Page Fault Service Time}$$
Where $p$ is the page fault probability ($0 \\le p \\le 1$).

> ⭐ **100% Marks Exam Tip**: Always draw the 6-step Page Fault flowchart and write the EAT formula to guarantee full marks from the university evaluator.`;
  }
  // Default General Response
  else {
    response = `Hello ${profile.name.split(' ')[0]}! As your personal AI assistant, I'm here to accelerate your workflow.

Here is what we can do together right now:
- 💻 **Coding Workspace**: Generate, debug, or optimize algorithms in Python, C++, TypeScript, SQL, and React.
- 🤖 **Autonomous Multi-Agent Mode**: Give me a high-level goal and my specialized agents (Architect, Engineer, QA Auditor, DevOps) will build it step-by-step.
- 🎓 **University Exam Solver & Viva Voce**: Practice audible oral viva questions and generate 10-mark exam sheets.
- 📑 **Lab Practical Record Generator**: 1-Click university manuals with aim, algorithms, source code, and sample I/O.
- 📅 **Task Planning**: Click "Plan My Day" to build an optimal study & coding schedule.
- 🎯 **Career & Resume Coach**: Audit your resume with ATS 90+ scoring and Google XYZ bullet rewrites.
- ✍️ **Content Studio**: Craft high-engagement LinkedIn posts, tweets, and YouTube scripts.

How can I help you dominate your goals today?`;
  }

  if (onChunk) {
    await simulateTokenStream(response, onChunk);
  }

  return response;
}
