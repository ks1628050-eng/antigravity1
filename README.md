# ⚡ Kedar AI — Personal AI Super-Copilot & Student Monetization Ecosystem

> An all-in-one, production-ready AI Assistant and Commercial SaaS Web Application tailored for B.Tech engineering students, coders, and student entrepreneurs. Built with React 19, TypeScript, Vite, Tailwind CSS, Google Gemini 2.5/2.0, Groq Llama 3.3 70B, and Autonomous Multi-Agent Swarms.

[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Groq Cloud](https://img.shields.io/badge/Groq-Llama_3.3_70B-F55036?style=for-the-badge&logo=groq)](https://groq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## 🌟 Key Capabilities & Features

### 🤖 1. Multi-Provider Real LLM Engine
- **Google Gemini**: Direct client-side streaming for `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`, and `gemini-1.5-flash`.
- **Groq Cloud (Ultra Fast)**: 800+ tokens/sec inference for `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, and `deepseek-r1-distill-llama-70b`.
- **OpenAI**: Native support for `gpt-4o`, `gpt-4o-mini`, and `o3-mini`.
- **OpenRouter**: Access to `deepseek/deepseek-r1` and `anthropic/claude-3.5-sonnet`.
- **Live Connection Test**: Instant latency and verification ping in Settings.
- **Smart Offline Contextual Brain**: High-quality contextual fallback when no API key is set.

### 🚀 2. Autonomous Multi-Agent Swarm
- **Supervisor Agent**: Decomposes complex user goals into specialized autonomous subtasks.
- **🏛️ System Architect Agent**: Designs system architecture, component trees, and database schemas.
- **💻 Lead Software Engineer Agent**: Generates type-safe production code (TypeScript, Python, C++, SQL).
- **🛡️ Security & QA Auditor Agent**: Audits OWASP risks, Big-O complexity, and writes automated test suites.
- **🚢 DevOps & Release Agent**: Generates Dockerfiles, GitHub Actions CI/CD workflows, and deployment commands.
- **Interactive Step Inspector**: Real-time code viewer, syntax highlighting, deliverable export, and 1-click download.

### 🎓 3. B.Tech Academic Super-Suite
- **10-Mark University Exam Solver**: Tuned for VTU, JNTU, SPPU, Anna Univ, AKTU syllabus. Produces structured answers with ASCII diagrams, mathematical derivations, and key memorization scoring points.
- **🎙️ Live Voice Viva Voce Examiner**: Strict virtual professor asking oral questions with Web Speech Synthesis and evaluating voice responses with dynamic /10 scoring and follow-ups.
- **📑 1-Click Lab Practical Record Generator**: Generates university-standard writeups (Aim, Requirements, Theory, Flowchart, Source Code, Sample I/O, and Top 5 Viva Questions) with 1-click Print / PDF formatting.
- **🚀 Capstone Project & IEEE Synopsis Architect**: Full minor/major engineering project blueprints with novelty statement, system architecture diagrams, database schemas, and 12-week milestones.

### 💰 4. Monetization & Business Engine
- **Subscription Tier System**:
  - *Free Student Tier*: 5 daily queries.
  - *Student Pro Tier*: ₹199/month (or ₹499/semester) unlocking unlimited AI, audio viva tests, and lab record downloads.
  - *Campus Placement Master*: ₹999/year.
- **Checkout Modal**: Direct zero-fee UPI QR code payment and Razorpay gateway integration with coupon discounts (`KEDAR50`).
- **Campus Ambassador Referral Hub**: Personalized referral links (`kedarai.app/ref/KEDAR-PRO99`), 30% recurring cash commission per student conversion, and instant UPI withdrawal tracking.

### 💻 5. Coding Studio & Big-O Analyzer
- Multi-language IDE for Python 3.12, C++20, React/TypeScript, and PostgreSQL.
- Line-by-line code explanation, bug detection, and mathematical $O(N)$ / $O(\log N)$ Time & Space complexity calculation.
- 1-Click file downloads (`.py`, `.cpp`, `.tsx`, `.sql`).

### 🎯 6. Career & ATS Resume Coach
- Real-time resume audit calculating overall ATS score out of 100 with LLM keyword extraction.
- Automatic **Google XYZ Formula** bullet point rewrites (*"Accomplished [X] measured by [Y] by doing [Z]"*).

### ✍️ 7. Multi-Platform Content Studio
- Generates high-converting content for LinkedIn, X/Twitter, Instagram, and YouTube across 6 voice tones (*Professional*, *Casual*, *Viral*, *Educational*, *Motivational*, *Hinglish*).

### 🧠 8. Persistent AI Memory Vault & Context Graph
- Automatically saves user background (skills, current semester, target roles) and injects active memories into prompt context.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (Dark Cyber-Academic Theme, Glassmorphism, Glow Tokens)
- **Icons**: Lucide React
- **Markdown & Code Highlighting**: Marked, PrismJS (C++, Python, TS, SQL, JSX)
- **Audio & Voice**: Web Speech API (SpeechSynthesis & SpeechRecognition)
- **AI Service Layer**: Google Gemini API, Groq Cloud API, OpenAI API, OpenRouter API, and Smart Offline Knowledge Engine
- **Persistence**: LocalStorage with full JSON Backup / Restore + Supabase Sync

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env` and add your API keys:
```bash
cp .env.example .env
```
*(You can also enter your API keys directly in the Settings UI!)*

### 3. Start development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production
```bash
npm run build
```

---

## 🌐 Deploy to Vercel

1. Push your repository to GitHub.
2. Import project in [Vercel](https://vercel.com).
3. Set Build Command: `npm run build` and Output Directory: `dist`.
4. Deploy with 1-click!
