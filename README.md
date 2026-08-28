# ⚡ Kedar AI — Personal AI Operating System for Students and Developers

> An all-in-one, full-stack AI workspace and personal operating system tailored for engineering students, developers, and builders. Combines conversational AI, persistent memory context graphs, AI-powered agile task planning, dynamic learning roadmaps, an 8-language coding studio, university exam solvers, and autonomous multi-agent planning.

[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_Postgres_RLS-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Groq Cloud](https://img.shields.io/badge/Groq-Llama_3.3_70B-F55036?style=for-the-badge&logo=groq)](https://groq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## 📌 1. Project Name
**Kedar AI — Personal AI Operating System for Students and Developers**

---

## 💡 2. Problem Statement
Engineering students and software developers frequently face fragmented workflows across multiple disconnected tools:
1. **Scattered Information**: Course notes, exam preparation, coding tasks, project architectures, and learning goals live in separate apps without unified context.
2. **Context Amnesia in AI**: Generic AI chatbots forget past interactions, user background (branch, semester, target role, technical stack), and project constraints.
3. **Academic & Career Overwhelm**: Students struggle with structured 10-mark university exam answers, viva voce oral examinations, lab records, and ATS-optimized resume formatting.
4. **Lack of Actionable Execution**: Most AI tools output plain text without directly decomposing goals into manageable task boards or actionable curriculum roadmaps.

**The Solution:**
**Kedar AI** unifies conversational intelligence, persistent memory injection, automated agile task decomposition, curriculum generation, a multi-language coding studio, and multi-step autonomous planning into a single secure, responsive full-stack platform.

---

## 🌟 3. Features

### ⭐ Core / Must-Have Features
1. **User Authentication & Profiles**:
   - Supabase Auth (Sign Up with Full Name, Email & Password, Sign In, Sign Out, Session persistence).
   - Protected routes and persistent user profile (`profiles` table) with branch, college, current semester, target role, and technical skills.
2. **AI Assistant & Chat History**:
   - Multi-provider LLM support (Google Gemini, Groq Llama 3.3 70B, OpenAI GPT-4o, OpenRouter).
   - Conversation management: Create new chats, rename, pin, and delete conversations.
   - Message persistence in Supabase PostgreSQL (`conversations` and `messages` tables).
   - Markdown rendering with PrismJS syntax highlighting and 1-click copy.
3. **Persistent AI Memory Vault**:
   - Save user facts, skills, project constraints, and career goals with category and importance tags (`high`, `medium`, `low`).
   - Search and filter memories in real time.
   - Automatic prompt injection: Active memories are dynamically injected into AI prompts for hyper-personalized responses.
4. **AI Task Planner & Agile Board**:
   - Full CRUD operations with priority (`high`, `medium`, `low`), status (`todo`, `in_progress`, `completed`), and deadlines.
   - **AI Task Breakdown**: Enter a major goal -> AI generates subtasks -> Review & select -> 1-click save to database.
   - **AI Priority Suggestion**: Analyzes complexity and timeline to recommend priority with rationale.
   - **Plan My Day**: Synthesizes time-blocked daily schedule from active tasks.
5. **Dynamic Learning Roadmaps**:
   - Enter any skill or topic (e.g. *"Learn Python from beginner to advanced"* or *"Full-Stack Rust & WebAssembly"*).
   - AI generates phases, topics, practice tasks, and milestone projects.
   - Save custom roadmaps to database (`learning_roadmaps` and `learning_items` tables), toggle topic completion, and track live progress percentage.
6. **Coding Studio & Optimization IDE**:
   - Supports 8 programming languages: **Python, C, C++, JavaScript, TypeScript, HTML, CSS, SQL**.
   - 4 AI Actions: **Generate Code, Explain Line-by-Line, Debug & Fix, Optimize (Big-O)**.
   - Interactive source editor, syntax highlighting, and 1-click code download.
7. **Academic Assistant (10-Mark Exam Solver)**:
   - Formulates university answers across VTU, JNTU, SPPU, Anna Univ syllabus.
   - Enforces strict 6-part scoring structure:
     1. Introduction & Context
     2. Standard Technical Definition
     3. Detailed Explanation & ASCII Architecture Diagram
     4. Concrete Working Example
     5. Applications & Key Advantages
     6. Conclusion & 5-Star Memorization Points
8. **Autonomous Multi-Step Agent Mode**:
   - Analyzes complex software/academic goals and decomposes them into specialized roles (**Supervisor, Architect, Engineer, Auditor, DevOps**).
   - Sequential execution with clear status tracking (**Planned, Executing, Completed, Failed**).
   - **Actionable Execution**: 1-click save agent steps to Task Planner, save plan to Learning Roadmaps, or export code deliverables.

### 🚀 Bonus Features
- **Voice Viva Voce Examiner**: Strict virtual professor asking oral viva questions with Web Speech Synthesis audio and evaluating voice responses with /10 scoring.
- **Lab Practical Record Generator**: 1-click printable lab writeups (Aim, Theory, Code, Sample I/O, Top 5 Viva Questions).
- **Capstone Project & IEEE Synopsis Architect**: Comprehensive minor/major project blueprints with novelty statement, system diagrams, and 12-week milestones.
- **Career & ATS Resume Coach**: Real-time ATS scoring with Google XYZ formula bullet point rewrites.
- **Multi-Platform Content Studio**: LinkedIn, Twitter/X, and Instagram post generation across 6 voice tones.
- **Micro-SaaS Business Idea Vault**: MVP roadmap and monetization blueprint generator.
- **Campus Ambassador Referral Hub**: Personalized referral links and UPI payout tracking.

---

## 🏗️ 4. System Architecture

```
                      USER
                        │
                        ▼
                KEDAR AI FRONTEND
            (React 19 + TypeScript + Vite)
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
      SUPABASE AUTH           SECURE AI BACKEND
   (Signup/Login/RLS)        (/api/ai/chat, Edge Fn)
            │                       │
            ▼                       ▼
     User Accounts            AI Provider API
    (JWT Auth Token)       (Gemini / Groq / OpenAI)
            │                       │
            └───────────┬───────────┘
                        ▼
                 SUPABASE DATABASE
                ├── profiles
                ├── conversations
                ├── messages
                ├── tasks
                ├── memories
                ├── learning_roadmaps
                └── learning_items
```

---

## 🛠️ 5. Technology Stack

- **Frontend**: React 19, TypeScript 5.7, Vite 6.2, Tailwind CSS 3.4
- **Backend & Auth**: Supabase Auth, Supabase PostgreSQL, Row Level Security (RLS)
- **AI Server Layer**: Secure Server-Side Proxy (`/api/ai/*`), Node.js Express server, Supabase Edge Functions (`ai-chat`)
- **AI Providers**: Google Gemini (`gemini-2.0-flash`, `gemini-2.5-flash`), Groq Cloud (`llama-3.3-70b-versatile`), OpenAI (`gpt-4o-mini`), OpenRouter
- **Icons & UI**: Lucide React, Canvas Confetti
- **Markdown & Highlighting**: Marked, PrismJS (C, C++, Python, TS, JS, SQL, HTML, CSS)
- **Voice & Speech**: Web Speech API (SpeechSynthesis & SpeechRecognition)

---

## 🗄️ 6. Database Schema & Security

The database utilizes Supabase PostgreSQL with strict Row Level Security (RLS) policies ensuring users only access their own records:

1. `profiles`: User account metadata, education, branch, college, semester, target role, skills, goals (`id` references `auth.users(id)`).
2. `conversations`: Chat sessions (`id`, `user_id`, `title`, `category`, `is_pinned`, `created_at`, `updated_at`).
3. `messages`: Chat message history (`id`, `conversation_id`, `role`, `content`, `created_at`).
4. `memories`: Persistent context facts (`id`, `user_id`, `content`, `category`, `importance`, `created_at`, `updated_at`).
5. `tasks`: Engineering task items (`id`, `user_id`, `title`, `description`, `priority`, `status`, `deadline`, `is_completed`, `created_at`).
6. `learning_roadmaps`: Generated learning paths (`id`, `user_id`, `title`, `description`, `icon`, `estimated_weeks`, `level`, `progress`, `created_at`).
7. `learning_items`: Roadmap topics and modules (`id`, `roadmap_id`, `title`, `description`, `completed`, `position`).
8. `business_ideas` & `content_posts`: Auxiliary creative studio stores.

### Database Migration
The complete database migration script is located at:
[`supabase/migrations/20260826000000_full_schema.sql`](file:///c:/Users/Kedar%20Swami/OneDrive/Desktop/antigravity/antigravity1/supabase/migrations/20260826000000_full_schema.sql).

---

## 🔐 7. Security Practices

- **Zero Secret Exposure in Frontend**: API keys (`GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY`) are kept exclusively on the server side in `.env` and processed via `/api/ai/*` or Supabase Edge Functions.
- **Row Level Security (RLS)**: Every SQL query validates `auth.uid() = user_id` at the database level.
- **Safe Authentication**: Uses Supabase Auth tokens over HTTPS with automatic refresh.

---

## 🚀 8. Setup Instructions (Run Locally)

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/your-username/kedar-ai.git
cd kedar-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and fill in your keys:
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Server-Side AI API Keys
AI_PROVIDER=gemini
AI_MODEL=gemini-2.0-flash
GEMINI_API_KEY=your-google-gemini-api-key
GROQ_API_KEY=your-groq-api-key
```

### 4. Apply Database Schema
Execute the SQL statements in [`supabase/migrations/20260826000000_full_schema.sql`](file:///c:/Users/Kedar%20Swami/OneDrive/Desktop/antigravity/antigravity1/supabase/migrations/20260826000000_full_schema.sql) in your Supabase SQL Editor.

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 9. Build & Production Deployment

### Build for production
```bash
npm run build
```

### Run standalone Node.js production server
```bash
npm start
```
*(Runs `node server.js` serving `dist/` with secure AI backend endpoints).*

### Deploy Frontend to Vercel
1. Import repository in [Vercel](https://vercel.com).
2. Set Build Command: `npm run build` and Output Directory: `dist`.
3. Add Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`).
4. Click **Deploy**.

---

## 📸 10. Screenshots
*(Screenshots of Dashboard, AI Chat Assistant, AI Task Planner, Learning Roadmaps, Coding Studio, 10-Mark Exam Solver, and Agent Mode)*

---

## 🌐 11. Live Demo & Repositories

- **Live Application URL**: `https://kedar-ai.vercel.app` *(or your deployed Vercel URL)*
- **GitHub Repository**: `https://github.com/your-username/kedar-ai`
- **Workshop Submission Form**: `https://forms.ccbp.in/build-your-ai-automation-platform-workshop-project-submission`

---

## 🔮 12. Future Improvements
- Multi-modal image and document OCR attachment processing in Chat.
- Local LLM execution via WebGPU (Wasm / WebLLM) for offline inference.
- Real-time collaborative peer study rooms and live pair coding.
- Discord & Telegram bot integrations with Kedar AI memory sync.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
