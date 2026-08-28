# Kedar AI — Personal AI Operating System

## Project Overview

Kedar AI is a unified AI-powered personal workspace designed for students and developers.

The platform combines conversational AI, persistent memory, task management, learning roadmaps, coding assistance, academic assistance, career support, content generation, business ideation, and basic AI agent planning.

The purpose of the project is to reduce context switching between multiple disconnected tools by providing a centralized AI workspace.

---

# Problem Statement

Students and aspiring developers often use different applications for:

- AI assistance
- Task management
- Learning
- Coding
- Exam preparation
- Career preparation
- Project planning
- Content creation

Switching between multiple tools makes it difficult to maintain context, track progress, and receive personalized assistance.

There is a need for a unified AI workspace that can maintain relevant user context and provide specialized assistance for different productivity and learning tasks.

---

# Solution

Kedar AI provides a centralized AI-powered workspace.

The application includes:

1. AI Assistant
2. Persistent Memory
3. Task Planner
4. Learning Roadmaps
5. Coding Studio
6. Academic Assistant
7. Career Assistant
8. Content Studio
9. Business Idea Generator
10. AI Agent Mode

The application uses authentication and persistent cloud storage to provide a personalized experience.

---

# Target Users

## Students

Students can use Kedar AI for:

- Exam preparation
- Academic questions
- Learning roadmaps
- Task planning
- Project development
- Coding support

## Developers

Developers can use:

- Code generation
- Debugging
- Code explanation
- Project planning

## Job Seekers

Users can access:

- Resume assistance
- Career guidance
- Skill development suggestions
- Interview preparation

---

# Core Features

## 1. Authentication

Features:

- User registration
- Login
- Logout
- Session persistence
- Protected routes

Users must only access their own data.

---

# 2. AI Assistant

The AI Assistant provides real AI-powered conversations.

Features:

- New conversation
- Send messages
- AI responses
- Chat history
- Rename conversation
- Delete conversation
- Markdown support
- Code block rendering

All conversations are stored persistently.

---

# 3. Persistent AI Memory

Users can save important information.

Memory features:

- Add memory
- View memory
- Edit memory
- Delete memory
- Search memory

Memory categories:

- Profile
- Education
- Skills
- Projects
- Goals
- Preferences
- Other

Relevant memories may be included when generating AI responses.

---

# 4. Task Planner

Users can:

- Create tasks
- Edit tasks
- Delete tasks
- Mark tasks completed
- Set priorities
- Set deadlines

AI features:

- Break down tasks
- Suggest priorities
- Generate daily plans

---

# 5. Learning Roadmaps

Users can enter a topic and generate an AI learning roadmap.

Each roadmap contains:

- Learning phases
- Topics
- Practice exercises
- Projects

Users can save roadmaps and track completion.

---

# 6. Coding Studio

The Coding Studio supports:

- Code generation
- Code explanation
- Debugging
- Optimization

Supported languages include:

- Python
- C
- C++
- JavaScript
- TypeScript
- HTML
- CSS
- SQL

---

# 7. Academic Assistant

The Academic Assistant helps students generate structured answers.

Supported features:

- Question input
- Subject selection
- Marks selection
- Structured AI-generated answers

For long answers, the system generates:

1. Introduction
2. Definition
3. Explanation
4. Examples
5. Applications
6. Conclusion

---

# 8. AI Agent Mode

Agent Mode provides basic multi-step AI planning.

Workflow:

User Goal
↓
Goal Analysis
↓
Plan Generation
↓
Task Breakdown
↓
Supported Tool Selection
↓
Execution
↓
Result

Supported actions include:

- Creating tasks
- Generating learning roadmaps
- Breaking down goals
- Generating code

The agent must not claim to perform unsupported actions.

---

# 9. Career Assistant

The Career Assistant provides:

- Resume feedback
- Skill suggestions
- Career guidance
- Interview preparation

---

# 10. Content Studio

The Content Studio can generate:

- LinkedIn posts
- Social media content
- Blog ideas
- Scripts
- Professional content

---

# 11. Business Idea Generator

The Business module helps users generate:

- Business ideas
- Problem statements
- Target audiences
- Features
- Monetization strategies
- MVP plans

---

# System Architecture

```text
User
│
▼
React + TypeScript Frontend
│
├── Authentication
│
├── AI Modules
│
└── User Interface
        │
        ▼
Secure Backend / Server Functions
        │
        ├── AI Provider
        │
        └── Supabase
              │
              ├── PostgreSQL Database
              ├── Authentication
              └── Row Level Security