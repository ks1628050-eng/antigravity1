# ⚡ Kedar AI — Personal AI Super-Copilot & Student Monetization Ecosystem

> An all-in-one, production-ready AI Assistant and Commercial SaaS Web Application tailored for B.Tech engineering students, coders, and student entrepreneurs.

[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## 🌟 Key Capabilities & Features

### 🎓 1. B.Tech Academic Super-Suite
- **10-Mark University Exam Solver**: Tuned for VTU, JNTU, SPPU, Anna Univ, AKTU syllabus. Produces structured answers with ASCII diagrams, mathematical derivations, and key memorization bullet points for full marks.
- **🎙️ Live Voice Viva Voce Examiner**: Strict virtual professor asking oral questions with Web Speech Synthesis and evaluating voice responses via Web Speech Recognition with instant /10 scoring.
- **📑 1-Click Lab Practical Record Generator**: Generates university-standard writeups (Aim, Requirements, Theory, Flowchart, Source Code, Sample I/O, and Top 5 Viva Questions with answers) with 1-click Print / PDF formatting.
- **🚀 Capstone Project & IEEE Synopsis Architect**: Full minor/major engineering project blueprints with novelty statement, system architecture diagrams, database schemas, and 12-week milestones.

### 💰 2. Monetization & Business Engine
- **Subscription Tier System**:
  - *Free Student Tier*: 5 daily queries.
  - *Student Pro Tier*: ₹199/month (or ₹499/semester) unlocking unlimited AI, audio viva tests, and lab record downloads.
  - *Campus Placement Master*: ₹999/year.
- **Interactive Checkout Modal**: Simulated UPI / QR code payment, promo code discount (`KEDAR50`), and instant PRO activation.
- **Campus Ambassador Referral Hub**: Personalized referral links (`kedarai.app/ref/KEDAR-PRO99`), 30% recurring cash commission per student conversion, and instant UPI withdrawal simulation.

### 💻 3. Coding Studio & Big-O Analyzer
- Multi-language IDE for Python 3.12, C++20, React/TypeScript, and PostgreSQL.
- Line-by-line code explanation, bug detection, and mathematical $O(N)$ / $O(\log N)$ Time & Space complexity calculation.
- 1-Click file downloads (`.py`, `.cpp`, `.tsx`, `.sql`).

### 🤖 4. Autonomous Agent Mode
- Decomposes high-level goals into 5-stage automated execution plans with live animated status indicators (`Pending` ➔ `In Progress` ➔ `Completed`) and downloadable artifacts.

### 🎯 5. Career & ATS Resume Coach
- Real-time resume audit calculating overall ATS score out of 100.
- Automatic **Google XYZ Formula** bullet point rewrites (*"Accomplished [X] measured by [Y] by doing [Z]"*).

### ✍️ 6. Multi-Platform Content Studio
- Generates high-converting content for LinkedIn, X/Twitter, Instagram, and YouTube across 6 voice tones (*Professional*, *Casual*, *Viral*, *Educational*, *Motivational*, *Hinglish*).

### 🧠 7. Persistent AI Memory Vault & Context Graph
- Automatically saves user background (skills, current semester, target roles) and injects active memories into prompt context.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (Dark Cyber-Academic Theme, Glassmorphism, Glow Tokens)
- **Icons**: Lucide React
- **Markdown & Code Highlighting**: Marked, PrismJS (C++, Python, TS, SQL)
- **Audio & Voice**: Web Speech API (SpeechSynthesis & SpeechRecognition)
- **AI Service Layer**: Google Gemini REST API, OpenAI API, and Smart Offline Knowledge Engine
- **Persistence**: LocalStorage with full JSON Backup / Restore

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/ks1628050-eng/antigravity1.git
cd antigravity1
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production
```bash
npm run build
```

### Cloud deployment

Copy `.env.example` to `.env.local` and set the Supabase project URL and public anon key. Apply `supabase/migrations/20260822000000_initial_schema.sql` in the Supabase SQL editor, then deploy the function and configure its secrets:

```bash
supabase functions deploy ai-chat
supabase secrets set GEMINI_API_KEY=your-server-key
# or: supabase secrets set OPENAI_API_KEY=your-server-key
supabase functions deploy payment
supabase secrets set RAZORPAY_KEY_ID=your-key-id RAZORPAY_KEY_SECRET=your-server-secret
```

When Supabase variables are present, Kedar AI requires authentication and syncs each user's workspace through RLS-protected storage. AI provider keys are read only by the Edge Function and are never stored in browser settings. Without Supabase variables, the local demo mode remains available.

---

## 👤 Author

**Kedar Swami**  
B.Tech in Computer Science & Engineering (AI & Data Science)  
GitHub: [@ks1628050-eng](https://github.com/ks1628050-eng)
