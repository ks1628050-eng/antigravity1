import { UserProfile, TaskItem, MemoryItem, LearningRoadmap, BusinessIdea, ContentPost, Conversation, ChatMessage, AISettings, ReferralStats } from '../types';

export const initialProfile: UserProfile = {
  name: 'Kedar Swami',
  email: 'kedar.swami@example.com',
  education: 'B.Tech in Computer Science & Engineering',
  branch: 'CSE (Artificial Intelligence & Data Science)',
  college: 'Engineering Institute of Technology',
  currentSemester: '6th Semester (3rd Year)',
  targetRole: 'Full Stack AI Engineer / SDE-1',
  userTier: 'pro',
  tierExpiresAt: '2027-08-30T00:00:00Z',
  referralCode: 'KEDAR-PRO99',
  skills: [
    'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'FastAPI', 
    'C++', 'Data Structures & Algorithms', 'PostgreSQL', 'Tailwind CSS', 
    'LangChain', 'Gemini API', 'Git & GitHub', 'Docker Basics'
  ],
  currentProjects: [
    'Kedar AI — Personal Multi-Persona Agent Ecosystem',
    'AI-Powered Code Reviewer & Bug Explainer',
    'Campus Connect — Real-time Student Collaboration Portal'
  ],
  interests: [
    'Autonomous AI Agents', 'Full Stack System Design', 'Open Source', 
    'Freelancing & Micro-SaaS', 'Competitive Programming (LeetCode)'
  ],
  preferredLearningStyle: 'Practical / Project-based',
  importantDeadlines: [
    { title: 'Major Project Submission & Synopsis', date: '2026-09-15', tag: 'College' },
    { title: 'TCS Digital / Campus Placement Registration', date: '2026-09-28', tag: 'Career' },
    { title: 'Complete 100 LeetCode Mediums Target', date: '2026-10-10', tag: 'Coding' },
    { title: 'Deploy Kedar AI to Production', date: '2026-08-30', tag: 'Project' }
  ],
  longTermGoals: [
    'Crack a Tier-1 Product Company or Remote AI Engineer Role ($20k+ / ₹25 LPA+)',
    'Launch a profitable Micro-SaaS product generating passive income',
    'Build a strong personal brand on LinkedIn and GitHub with 10k+ tech followers'
  ],
  bio: 'Passionate B.Tech engineer & builder crafting modern AI-powered applications, solving complex algorithms, and building scalable full-stack products.'
};

export const initialReferralStats: ReferralStats = {
  referralCode: 'KEDAR-PRO99',
  totalClicks: 0,
  freeSignups: 0,
  paidConversions: 0,
  totalEarnings: 0,
  pendingPayout: 0,
  upiId: ''
};

export const initialTasks: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Solve 3 Dynamic Programming problems on LeetCode',
    description: 'Practice Longest Common Subsequence (LCS) and 0/1 Knapsack variations.',
    priority: 'high',
    category: 'coding',
    deadline: '2026-08-23',
    isCompleted: false,
    createdAt: '2026-08-22T10:00:00Z'
  },
  {
    id: 'task-2',
    title: 'Draft ATS Resume for Full Stack & AI Internships',
    description: 'Add Kedar AI project metrics, optimize bullet points with Google XYZ formula.',
    priority: 'high',
    category: 'career',
    deadline: '2026-08-24',
    isCompleted: false,
    createdAt: '2026-08-22T11:00:00Z'
  },
  {
    id: 'task-3',
    title: 'Complete Module 4: LangChain & Vector Embeddings',
    description: 'Implement RAG pipeline using ChromaDB and Gemini Embeddings.',
    priority: 'medium',
    category: 'academics',
    deadline: '2026-08-25',
    isCompleted: false,
    createdAt: '2026-08-22T12:00:00Z'
  },
  {
    id: 'task-4',
    title: 'Publish LinkedIn post on building Autonomous Agents in 2026',
    description: 'Share architectural insights, screenshots, and learnings from Kedar AI.',
    priority: 'medium',
    category: 'personal',
    deadline: '2026-08-26',
    isCompleted: true,
    createdAt: '2026-08-21T09:00:00Z',
    completedAt: '2026-08-22T14:30:00Z'
  },
  {
    id: 'task-5',
    title: 'Submit Operating Systems Lab Record Assignment 4',
    description: 'Banker\'s Algorithm & Deadlock Avoidance code in C++ with sample I/O.',
    priority: 'high',
    category: 'academics',
    deadline: '2026-08-27',
    isCompleted: false,
    createdAt: '2026-08-22T14:00:00Z'
  }
];

export const initialMemories: MemoryItem[] = [
  {
    id: 'mem-1',
    content: 'Kedar is proficient in React, TypeScript, Next.js, and Python. Always provide clean, modern, type-safe code.',
    category: 'skills',
    createdAt: '2026-08-20T08:00:00Z'
  },
  {
    id: 'mem-2',
    content: 'Kedar is targeting Full Stack AI Engineer and SDE-1 roles at high-growth tech startups and top product companies.',
    category: 'career',
    createdAt: '2026-08-20T08:05:00Z'
  },
  {
    id: 'mem-3',
    content: 'Prefers explanations with practical code snippets and Big-O time/space complexity analysis over pure theory.',
    category: 'preferences',
    createdAt: '2026-08-21T10:00:00Z'
  },
  {
    id: 'mem-4',
    content: 'Currently working on Kedar AI — an autonomous multi-persona assistant ecosystem.',
    category: 'projects',
    createdAt: '2026-08-21T12:00:00Z'
  },
  {
    id: 'mem-5',
    content: 'Wants to build a freelance client base and launch a Micro-SaaS startup.',
    category: 'general',
    createdAt: '2026-08-22T09:00:00Z'
  }
];

export const initialRoadmaps: LearningRoadmap[] = [
  {
    id: 'roadmap-genai',
    title: 'Generative AI & Autonomous Agent Architecture',
    description: 'Master LLMs, Vector DBs, Prompt Engineering, RAG Pipelines, and Multi-Agent Orchestration.',
    icon: 'BrainCircuit',
    estimatedWeeks: 8,
    level: 'Advanced',
    progress: 65,
    modules: [
      { id: 'm1', title: 'Foundations of LLMs & API Integration', topics: ['Tokenization & Context Windows', 'Gemini & OpenAI APIs', 'Structured JSON Output'], completed: true },
      { id: 'm2', title: 'Retrieval Augmented Generation (RAG)', topics: ['Embeddings & Cosine Similarity', 'ChromaDB & Pinecone', 'Hybrid Search & Re-ranking'], completed: true },
      { id: 'm3', title: 'Autonomous Multi-Agent Systems', topics: ['Tool Calling & Function Execution', 'Plan-and-Solve Agents', 'Stateful Memory Graphs'], completed: false },
      { id: 'm4', title: 'Production Deployment & Evaluation', topics: ['Latency Optimization & Streaming', 'Traces & Telemetry', 'Dockerizing AI Microservices'], completed: false }
    ]
  },
  {
    id: 'roadmap-dsa',
    title: 'Data Structures & Algorithms (SDE Sheet)',
    description: 'Crack coding rounds with deep mastery in Trees, Dynamic Programming, Graphs, and System Design basics.',
    icon: 'Binary',
    estimatedWeeks: 12,
    level: 'Intermediate',
    progress: 78,
    modules: [
      { id: 'd1', title: 'Arrays, Strings & Two Pointers', topics: ['Sliding Window', 'Kadane\'s Algorithm', 'Dutch National Flag'], completed: true },
      { id: 'd2', title: 'Linked Lists, Stacks & Queues', topics: ['LRU Cache', 'Monotonic Stack', 'Reverse Nodes in k-Group'], completed: true },
      { id: 'd3', title: 'Binary Trees & BSTs', topics: ['Tree Traversals', 'Lowest Common Ancestor', 'Serialize & Deserialize'], completed: true },
      { id: 'd4', title: 'Dynamic Programming Masterclass', topics: ['0/1 Knapsack Variations', 'Matrix Chain Multiplication', 'DP on Trees & Grids'], completed: false },
      { id: 'd5', title: 'Graphs & Disjoint Set Union', topics: ['BFS/DFS Traversals', 'Dijkstra & Bellman-Ford', 'Kruskal\'s Algorithm'], completed: false }
    ]
  },
  {
    id: 'roadmap-fullstack',
    title: 'Modern Full-Stack Next.js 15 & Cloud',
    description: 'Build hyper-scalable web apps with Server Actions, Tailwind CSS, PostgreSQL, Prisma, and Supabase.',
    icon: 'Layers',
    estimatedWeeks: 10,
    level: 'Intermediate',
    progress: 85,
    modules: [
      { id: 'f1', title: 'Next.js App Router & Server Components', topics: ['Server Actions', 'Streaming SSR', 'Layouts & Nested Routes'], completed: true },
      { id: 'f2', title: 'Database Modeling & Authentication', topics: ['PostgreSQL & Supabase Auth', 'Prisma ORM Migrations', 'Row Level Security'], completed: true },
      { id: 'f3', title: 'Real-time & WebSockets', topics: ['Server-Sent Events (SSE)', 'WebSockets with Socket.io', 'Optimistic UI Updates'], completed: true },
      { id: 'f4', title: 'Cloud CI/CD & Production Monitoring', topics: ['Vercel & AWS Deployments', 'Redis Caching (Upstash)', 'Security Headers & Rate Limiting'], completed: false }
    ]
  }
];

export const initialConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Building Real-time Voice Agents with WebRTC & Gemini',
    createdAt: '2026-08-22T18:30:00Z',
    updatedAt: '2026-08-22T19:15:00Z',
    category: 'coding',
    isPinned: true
  },
  {
    id: 'conv-2',
    title: 'Resume Review & SDE-1 ATS Keyword Optimization',
    createdAt: '2026-08-21T14:10:00Z',
    updatedAt: '2026-08-21T14:45:00Z',
    category: 'career',
    isPinned: false
  },
  {
    id: 'conv-3',
    title: 'Micro-SaaS Ideas for Developer Productivity Tools',
    createdAt: '2026-08-20T11:00:00Z',
    updatedAt: '2026-08-20T11:35:00Z',
    category: 'business',
    isPinned: false
  }
];

export const initialMessages: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'm-1',
      conversationId: 'conv-1',
      role: 'user',
      content: 'How can I architect a real-time speech-to-speech AI agent in React with low latency?',
      timestamp: '2026-08-22T18:30:00Z'
    },
    {
      id: 'm-2',
      conversationId: 'conv-1',
      role: 'assistant',
      content: `Hey Kedar! For a low-latency real-time voice agent in your stack (**React + TypeScript + WebSockets**), here is the battle-tested architecture:

### ⚡ 3-Tier Low Latency Architecture:

1. **Audio Capture (Client)**:
   - Use the **Web Audio API** with an \`AudioWorkletNode\` (16kHz PCM audio buffer chunking) rather than waiting for \`MediaRecorder\` blobs.
   - Stream binary audio frames directly over a persistent **WebSocket connection**.

2. **Backend Streaming Gateway (FastAPI / Node.js)**:
   - Pipe raw audio chunks directly to **Gemini Live Multimodal API** / Whisper Streaming.
   - Receive incremental audio byte chunks and text tokens via duplex streaming.

3. **Audio Playback (Client Pipeline)**:
   - Queue received audio chunks into an \`AudioBufferSourceNode\` ring buffer for jitter-free gapless playback.

\`\`\`typescript
// Quick AudioWorklet Streamer Snippet
export class AudioStreamer {
  private audioContext: AudioContext;
  private socket: WebSocket;

  constructor(socketUrl: string) {
    this.audioContext = new AudioContext({ sampleRate: 16000 });
    this.socket = new WebSocket(socketUrl);
  }

  async startStreaming() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = this.audioContext.createMediaStreamSource(stream);
    
    await this.audioContext.audioWorklet.addModule('/pcm-processor.js');
    const workletNode = new AudioWorkletNode(this.audioContext, 'pcm-processor');
    
    workletNode.port.onmessage = (event) => {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(event.data); // Raw PCM Int16 buffer
      }
    };
    
    source.connect(workletNode);
  }
}
\`\`\`

Would you like me to generate the complete backend WebSocket handler or help you integrate this directly into **Kedar AI**?`,
      timestamp: '2026-08-22T18:30:05Z'
    }
  ]
};

export const initialBusinessIdeas: BusinessIdea[] = [
  {
    id: 'biz-1',
    title: 'RepoPulse — AI PR Reviewer & Security Gate for Startups',
    tagline: 'Automate code quality, security vulnerability scans, and architecture drift checks on every pull request.',
    problem: 'Small engineering teams spend 30%+ of their time doing repetitive code reviews and often miss subtle memory leaks, OWASP security holes, and regression bugs.',
    solution: 'A GitHub App that runs deep static analysis combined with fine-tuned LLM reasoning to post line-specific suggestions, benchmark time complexity ($O(N)$), and check unit test coverage.',
    targetAudience: 'Early-stage tech startups, YC founders, freelance agencies, and boutique software consultancies.',
    techStack: ['Next.js 15', 'TypeScript', 'FastAPI', 'Tree-Sitter AST Parser', 'PostgreSQL', 'Stripe Billing'],
    monetization: [
      'Free for Open Source repositories',
      'Pro Plan: $29/seat/month (unlimited repos & automated PR patches)',
      'Enterprise: $249/month (custom security rules & self-hosted option)'
    ],
    mvpPlan: [
      { week: 1, goal: 'GitHub Webhook & Auth', tasks: ['Set up GitHub OAuth', 'Handle pull_request webhook events', 'Extract PR diffs'] },
      { week: 2, goal: 'AI Review Pipeline', tasks: ['Format diff context', 'Run AST parser for syntax trees', 'Send prompts to Gemini Flash'] },
      { week: 3, goal: 'GitHub Comments API', tasks: ['Post review comments on exact line numbers', 'Dashboard for team analytics'] },
      { week: 4, goal: 'Billing & Launch', tasks: ['Stripe webhook integration', 'Launch on Product Hunt & Hacker News'] }
    ],
    goToAction: [
      'Create GitHub App manifest and test on personal repositories',
      'Reach out to 10 indie developers on X / LinkedIn for initial beta feedback',
      'Publish technical teardown article on "How I automated PR reviews with Gemini"'
    ],
    createdAt: '2026-08-21T10:00:00Z'
  },
  {
    id: 'biz-2',
    title: 'CampusPrep AI — University Exam & Viva Simulator for Engineering Students',
    tagline: 'Transform university syllabus and previous year questions into instant 10-mark answers and mock oral viva exams.',
    problem: 'Engineering students struggle with outdated textbook material, lack of structured viva question banks, and last-minute exam stress.',
    solution: 'Branch-specific AI tutor tuned to VTU/JNTU/SPPU/Anna University patterns that generates 2-mark definitions, 10-mark structured answers, and interactive audio viva tests.',
    targetAudience: '10M+ B.Tech & Polytechnic students in India and international STEM undergraduates.',
    techStack: ['React', 'Tailwind CSS', 'Python', 'FastAPI', 'Web Speech API', 'Razorpay / UPI Payment Gateway'],
    monetization: [
      'Freemium (3 free viva tests/day)',
      'Semester Pass: ₹499/semester (unlimited questions, lab records, and mock viva)',
      'College Campus License: ₹50,000/year per department'
    ],
    mvpPlan: [
      { week: 1, goal: 'Syllabus & PYQ Ingestion', tasks: ['Ingest top 5 branch curricula', 'Extract standard 2-mark and 10-mark question templates'] },
      { week: 2, goal: 'Viva Voice Simulator', tasks: ['Build Web Speech text-to-speech & speech recognition interface', 'AI scoring rubric'] },
      { week: 3, goal: 'Lab Record Generator', tasks: ['Auto-generate Aim, Theory, Code, Sample I/O, and Circuit diagrams in Markdown'] },
      { week: 4, goal: 'Campus Ambassador Launch', tasks: ['Onboard student reps across 15 engineering colleges', 'Run viral WhatsApp study groups'] }
    ],
    goToAction: [
      'Test viva voice mode on classmates and collect feedback',
      'Create Instagram & LinkedIn short video reels demonstrating 10-mark instant answer generation',
      'Set up UPI QR code payment for early bird beta testers'
    ],
    createdAt: '2026-08-22T12:00:00Z'
  }
];

export const initialSettings: AISettings = {
  provider: 'mock',
  model: 'gemini-1.5-flash',
  temperature: 0.7,
  theme: 'dark',
  autoSaveMemory: true,
  voiceSynthesis: true
};
