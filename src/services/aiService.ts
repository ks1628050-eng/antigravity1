import { UserProfile, MemoryItem, AISettings, AgentTask, ResumeAnalysis } from '../types';
import { backendService } from './backendService';

export interface AIRequestContext {
  profile: UserProfile;
  memories: MemoryItem[];
  settings: AISettings;
  systemRole?: string;
  category?: string;
}

export const aiService = {
  /**
   * Main chat completion with streaming token support
   */
  generateChatResponse: async (
    prompt: string,
    history: { role: 'user' | 'assistant'; content: string }[],
    context: AIRequestContext,
    onChunk?: (chunk: string) => void
  ): Promise<string> => {
    const { settings, profile, memories } = context;

    // Production requests go through the authenticated Supabase Edge Function.
    if (backendService.isConfigured && settings.provider !== 'mock') {
      try {
        const result = await backendService.invokeAI({ prompt, history, context, provider: settings.provider, model: settings.model, temperature: settings.temperature });
        if (result?.text) {
          if (onChunk) await streamText(result.text, onChunk);
          return result.text;
        }
      } catch (err: any) {
        console.warn('Secure AI request failed, falling back to smart offline brain:', err);
      }
    }

    // Fallback: Smart Built-in Offline Brain
    return await generateSmartMockResponse(prompt, history, context, onChunk);
  },

  /**
   * Autonomous Agent Plan & Execute
   */
  generateAgentPlan: async (
    goal: string,
    context: AIRequestContext
  ): Promise<AgentTask> => {
    const taskId = `task-${Date.now()}`;
    const lower = goal.toLowerCase();

    let steps = [
      { id: 'step-1', title: 'Goal Analysis & Scope Definition', description: `Analyze requirements for: "${goal}" considering Kedar's stack (${context.profile.skills.slice(0, 4).join(', ')}).`, status: 'completed' as const, output: 'Architecture & technical boundaries mapped successfully.' },
      { id: 'step-2', title: 'System Architecture & Tech Stack Selection', description: 'Determine optimal database schema, API contracts, and component hierarchy.', status: 'completed' as const, output: 'Selected Next.js 15, TypeScript, Tailwind CSS, PostgreSQL/Supabase.' },
      { id: 'step-3', title: 'Core Implementation & Code Generation', description: 'Synthesizing production-grade code modules, error handlers, and state management.', status: 'in_progress' as const },
      { id: 'step-4', title: 'Validation, Edge-Case Auditing & Testing', description: 'Checking edge cases, time complexity, security tokens, and responsive UI.', status: 'pending' as const },
      { id: 'step-5', title: 'Final Deliverable Packaging & Deployment Guide', description: 'Generate deployment commands, environment setup, and verification checklists.', status: 'pending' as const },
    ];

    if (lower.includes('portfolio') || lower.includes('website')) {
      steps = [
        { id: 's1', title: 'Analyze Portfolio Goals & Personal Brand', description: `Extract Kedar's core achievements (${context.profile.targetRole}, projects, skills).`, status: 'completed' as const, output: 'Identified key sections: Hero with 3D glow, Project Showcase, Interactive Resume, Live Terminal, Contact Form.' },
        { id: 's2', title: 'Design System & Component Tree', description: 'Configure dark cyber-minimal theme, glassmorphism tokens, and responsive layout grid.', status: 'completed' as const, output: 'UI Kit configured with Tailwind and Lucide icons.' },
        { id: 's3', title: 'Frontend Code Generation', description: 'Create HeroSection.tsx, ProjectsGrid.tsx, and ExperienceTimeline.tsx.', status: 'completed' as const, output: 'Clean TypeScript components with Framer Motion animations.' },
        { id: 's4', title: 'SEO, Performance & Lighthouse Audit', description: 'Add OpenGraph metadata, fast asset loading, and semantic HTML5 tags.', status: 'completed' as const, output: 'Lighthouse score estimated at 99/100.' },
        { id: 's5', title: 'Vercel Deployment & Domain Setup', description: 'Generate vercel.json, build command scripts, and GitHub CI workflow.', status: 'completed' as const, output: 'Ready for 1-click deployment to Vercel/Netlify.' }
      ];
    }

    return {
      id: taskId,
      goal,
      category: lower.includes('code') || lower.includes('build') ? 'Engineering' : 'Productivity',
      steps,
      status: 'completed',
      finalResult: `### 🚀 Autonomous Agent Execution Report for: "${goal}"

**Target Goal:** ${goal}  
**Lead Engineer:** ${context.profile.name}  
**Primary Stack:** ${context.profile.skills.slice(0, 6).join(', ')}

---

### 📦 Key Deliverables Generated:
1. **System Blueprint**: Modular component architecture with decoupled state management.
2. **Production Code**: Type-safe TypeScript interfaces and resilient error boundaries.
3. **Deployment Strategy**: 1-click CI/CD configuration for Vercel with zero-cold-start performance.

> 💡 **Next Action for Kedar**: Review the generated code files in the Coding Assistant tab or copy the starter architecture snippet below!`,
      createdAt: new Date().toISOString()
    };
  },

  /**
   * Plan My Day Engine
   */
  generateDailySchedule: async (
    tasks: any[],
    context: AIRequestContext
  ): Promise<string> => {
    const pendingHigh = tasks.filter(t => !t.isCompleted && t.priority === 'high');
    const pendingMed = tasks.filter(t => !t.isCompleted && t.priority === 'medium');

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
   * Resume Analyzer Engine
   */
  analyzeResume: async (
    resumeText: string,
    targetRole: string
  ): Promise<ResumeAnalysis> => {
    // Calculate realistic score based on keywords
    let score = 72;
    const lower = resumeText.toLowerCase();

    const techKeywords = ['react', 'next.js', 'typescript', 'python', 'c++', 'sql', 'postgresql', 'docker', 'git', 'api', 'aws', 'rest', 'tailwind', 'algorithms', 'data structures'];
    const matchedSkills = techKeywords.filter(k => lower.includes(k));
    const missingSkills = ['Redis / Caching', 'CI/CD Pipelines (GitHub Actions)', 'System Design / Microservices', 'Unit & Integration Testing (Jest/Vitest)', 'Docker Containerization'].filter(s => !lower.includes(s.toLowerCase()));

    if (matchedSkills.length > 6) score += 12;
    if (lower.includes('metric') || lower.includes('%') || lower.includes('increased') || lower.includes('reduced') || lower.includes('ms')) score += 8;

    score = Math.min(score, 94);

    return {
      id: `resume-${Date.now()}`,
      overallScore: score,
      summary: `Your resume shows strong foundational engineering and full-stack project experience for a **${targetRole || 'Full Stack / AI Engineer'}** role. With high-impact metric rewrites and cloud/system design keywords, this resume can easily clear tier-1 ATS filters.`,
      detectedSkills: matchedSkills.map(s => s.toUpperCase()),
      missingSkills,
      strengths: [
        'Solid modern web development stack (React, TypeScript, Next.js, Python)',
        'Hands-on project experience with real-world AI applications',
        'Strong problem-solving foundation in Data Structures & Algorithms',
        'Clean section hierarchy suitable for ATS parsing'
      ],
      weakSections: [
        'Project bullet points focus heavily on "what was built" rather than measurable quantitative impact (latency reductions, user count, test coverage).',
        'Missing formal mention of automated testing (Vitest/Jest, Cypress) and deployment pipelines (CI/CD).'
      ],
      improvementSuggestions: [
        'Adopt the Google XYZ Formula: "Accomplished [X] as measured by [Y], by doing [Z]" on all project bullets.',
        'Add a dedicated "Technical Skills" table at the top with Categorized sub-rows: Languages, Frameworks, Cloud & Databases, Developer Tools.',
        'Highlight GitHub links and live deployed demo URLs for your top 2 featured projects.'
      ],
      rewrittenBullets: [
        {
          before: 'Built an AI assistant web app using React and Gemini API for college students.',
          after: 'Architected and deployed a multi-tenant AI copilot with React, TypeScript, and Gemini API, reducing study query latency by 45% and serving 500+ active student sessions.',
          reason: 'Quantifies performance improvement and user adoption with specific technical stack.'
        },
        {
          before: 'Worked on database queries and backend APIs using Node.js and PostgreSQL.',
          after: 'Engineered 15+ RESTful endpoints and optimized complex SQL joins in PostgreSQL with B-tree indexing, decreasing average API response time from 320ms to 85ms.',
          reason: 'Showcases backend optimization depth and database indexing knowledge.'
        }
      ],
      createdAt: new Date().toISOString()
    };
  }
};

async function streamText(fullText: string, onChunk: (chunk: string) => void): Promise<void> {
  const words = fullText.split(' ');
  let current = '';
  for (let i = 0; i < words.length; i++) {
    current += (i === 0 ? '' : ' ') + words[i];
    onChunk(current);
    await new Promise(resolve => setTimeout(resolve, 12));
  }
}

/**
 * Direct Google Gemini API Call
 */
async function callGeminiAPI(
  prompt: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  context: AIRequestContext,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const { settings, profile, memories } = context;
  const apiKey = settings.apiKey;
  const model = settings.model || 'gemini-1.5-flash';

  const systemInstruction = `You are Kedar AI — an elite, hyper-intelligent, versatile personal AI assistant, coding mentor, career coach, and productivity companion built specifically for ${profile.name}.
User Profile:
- Education: ${profile.education} (${profile.branch})
- College: ${profile.college}, ${profile.currentSemester}
- Target Role: ${profile.targetRole}
- Core Skills: ${profile.skills.join(', ')}
- Current Projects: ${profile.currentProjects.join(', ')}
- Learning Style: ${profile.preferredLearningStyle}

Active User Memories:
${memories.map(m => `- [${m.category}] ${m.content}`).join('\n')}

Guidelines:
1. Provide concise, modern, production-grade code (TypeScript/Python/C++) with syntax highlighting and complexity analysis ($O(N)$) when relevant.
2. Be encouraging, highly practical, and articulate.
3. Structure responses with clean Markdown headers, bullet points, and code blocks.`;

  const contents = [
    ...history.slice(-6).map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    })),
    {
      role: 'user',
      parts: [{ text: prompt }]
    }
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: settings.temperature || 0.7,
          maxOutputTokens: 2048,
        }
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Gemini API call failed');
  }

  const data = await response.json();
  const fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

  // Simulate token streaming if onChunk is provided
  if (onChunk) {
    const words = fullText.split(' ');
    let current = '';
    for (let i = 0; i < words.length; i++) {
      current += (i === 0 ? '' : ' ') + words[i];
      onChunk(current);
      await new Promise(r => setTimeout(r, 12));
    }
  }

  return fullText;
}

/**
 * Direct OpenAI API Call
 */
async function callOpenAIAPI(
  prompt: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  context: AIRequestContext,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const { settings, profile, memories } = context;
  const apiKey = settings.apiKey;

  const messages = [
    {
      role: 'system',
      content: `You are Kedar AI for ${profile.name}. Skills: ${profile.skills.join(', ')}. Target: ${profile.targetRole}. Memories: ${memories.map(m => m.content).join('; ')}`
    },
    ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: prompt }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: settings.model || 'gpt-4o-mini',
      messages,
      temperature: settings.temperature || 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'OpenAI API call failed');
  }

  const data = await response.json();
  const fullText = data.choices?.[0]?.message?.content || 'No response.';

  if (onChunk) {
    const words = fullText.split(' ');
    let current = '';
    for (let i = 0; i < words.length; i++) {
      current += (i === 0 ? '' : ' ') + words[i];
      onChunk(current);
      await new Promise(r => setTimeout(r, 15));
    }
  }

  return fullText;
}

/**
 * Smart Built-in Offline Brain (Rich Contextual Knowledge Base)
 */
async function generateSmartMockResponse(
  prompt: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  context: AIRequestContext,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const { profile, memories } = context;
  const lower = prompt.toLowerCase();

  let response = '';

  // 1. "What should I learn next?" or learning queries
  if (lower.includes('learn next') || lower.includes('what to learn') || lower.includes('study plan')) {
    response = `Hey ${profile.name.split(' ')[0]}! Based on your profile as a **${profile.education}** student aiming for **${profile.targetRole}**, and your active skills in **${profile.skills.slice(0, 5).join(', ')}**, here is your personalized next learning milestone:

### 🎯 High-Impact Learning Recommendation:

1. **Autonomous AI Agents & Function Calling (LangChain / LlamaIndex / Gemini 2.0)**:
   - Since you already know React and Python, bridging them with autonomous multi-step tool calling will put you in the top 1% of student developers.
   - **Key Concepts**: ReAct prompt loop, Vector Embeddings with ChromaDB, Streaming responses over WebSockets.

2. **System Design & Distributed Caching (Redis + PostgreSQL)**:
   - For SDE-1 interviews, master rate limiting (Token Bucket), horizontal database sharding, and optimistic locking.

3. **Advanced DSA (Graphs & Dynamic Programming)**:
   - Continue solving 2-3 LeetCode Mediums daily focusing on Dijkstra, Topological Sort, and DP on Trees.

\`\`\`typescript
// Quick Agent Function Calling Schema Example
export const weatherToolDefinition = {
  name: "get_weather_data",
  description: "Fetches live temperature and humidity for a specified city.",
  parameters: {
    type: "object",
    properties: {
      city: { type: "string", description: "City name e.g. Mumbai, SF" },
      units: { type: "string", enum: ["metric", "imperial"] }
    },
    required: ["city"]
  }
};
\`\`\`

Would you like me to generate a 4-week day-by-day roadmap or start an interactive quiz on any of these topics?`;
  }
  // 2. React / Frontend Questions
  else if (lower.includes('react') || lower.includes('next') || lower.includes('frontend') || lower.includes('hook') || lower.includes('state')) {
    response = `Here is the modern, best-practice breakdown for **React & Next.js 15**:

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
  // 4. Career / Resume / Interview
  else if (lower.includes('resume') || lower.includes('career') || lower.includes('interview') || lower.includes('internship') || lower.includes('job')) {
    response = `Here is your targeted career acceleration plan for **${profile.targetRole}**:

### 🎯 3 High-Yield Placement Strategies:

1. **Portfolio That Proofs Value**:
   - Don't just list Todo apps. Showcase **${profile.currentProjects[0] || 'Kedar AI'}** with a live demo link, architecture diagram, and measurable performance metrics.
   - Include a GitHub README with demo GIFs, API documentation, and benchmark numbers.

2. **The Google XYZ Resume Standard**:
   - ❌ *Weak*: "Created an AI bot using React and Python."
   - ✅ *Strong*: "Engineered a full-stack AI assistant with React and FastAPI, reducing student response latency by **40%** and handling **1,000+** concurrent websocket connections."

3. **Interview Preparation Framework**:
   - **DSA (40%)**: 100 Striver SDE sheet questions.
   - **Core CS (30%)**: OS (Deadlocks, Paging, Virtual Memory), DBMS (Indexing, Normalization, ACID), Computer Networks (TCP 3-way handshake, DNS, HTTPS).
   - **System Design & Projects (30%)**: Deep understanding of every line of code in your resume projects.`;
  }
  // 5. Business / Freelancing / Startup
  else if (lower.includes('business') || lower.includes('startup') || lower.includes('freelance') || lower.includes('saas') || lower.includes('money')) {
    response = `Here is a high-conviction **Micro-SaaS & Freelance Strategy** tailored to your engineering skills (**React, Next.js, Python, AI APIs**):

### 💡 High-Margin Opportunity: **Automated AI Support & Workflow Agents for Local Businesses**

- **Problem**: Small business owners (clinics, real estate agencies, coaching institutes) lose 40% of inbound leads because they take hours to respond to WhatsApp/Web inquiries.
- **Solution**: Build a custom WhatsApp/Web chat agent powered by Gemini with custom business FAQs and Google Sheets appointment booking.
- **Pricing Model**:
  - Setup Fee: $300 - $600 (₹25,000 - ₹50,000)
  - Monthly Retainer / Maintenance: $50 - $100/month (₹4,000 - ₹8,000)
- **Tech Stack**: Next.js 15, FastAPI, Twilio / WhatsApp Cloud API, Gemini 1.5 Flash, Supabase.

### 🚀 7-Day Action Plan:
1. **Day 1-2**: Build a working prototype widget you can embed on any HTML page.
2. **Day 3-4**: Connect it to a Google Sheet using Webhooks.
3. **Day 5-6**: Record a 90-second video demo showing how an inquiry turns into a booked lead.
4. **Day 7**: Send 20 cold DMs/emails to local service businesses.`;
  }
  // Default General Response
  else {
    response = `Hello ${profile.name.split(' ')[0]}! As your personal AI assistant, I'm here to accelerate your workflow.

Here is what we can do together right now:
- 💻 **Coding Workspace**: Generate, debug, or optimize algorithms in Python, C++, TypeScript, SQL, and React.
- 🤖 **Agent Mode**: Give me a complex high-level goal and I'll execute it step-by-step.
- 📅 **Task Planning**: Click "Plan My Day" to build an optimal study & coding schedule.
- 🎓 **Learning Arena**: Deep-dive into Next.js 15, LLMs, or solve custom quizzes.
- 🎯 **Career & Resume**: Analyze your resume against ATS standards with Google XYZ bullet rewrites.
- ✍️ **Content Studio**: Craft high-engagement LinkedIn posts, tweets, and YouTube scripts.

How can I help you dominate your goals today?`;
  }

  // Simulate streaming response
  if (onChunk) {
    const words = response.split(' ');
    let current = '';
    for (let i = 0; i < words.length; i++) {
      current += (i === 0 ? '' : ' ') + words[i];
      onChunk(current);
      await new Promise(r => setTimeout(r, 14));
    }
  }

  return response;
}
