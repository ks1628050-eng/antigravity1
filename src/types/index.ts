export type NavSection = 
  | 'dashboard'
  | 'chat'
  | 'agent'
  | 'exam-solver'
  | 'viva-simulator'
  | 'lab-record'
  | 'project-architect'
  | 'tasks'
  | 'learning'
  | 'coding'
  | 'career'
  | 'content'
  | 'business'
  | 'affiliate'
  | 'memory'
  | 'settings';

export type UserTier = 'free' | 'pro' | 'campus';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  education: string;
  branch: string;
  college: string;
  currentSemester: string;
  targetRole: string;
  skills: string[];
  currentProjects: string[];
  interests: string[];
  preferredLearningStyle: 'Practical / Project-based' | 'Visual & Diagrams' | 'Theoretical Deep-dive' | 'Speed / Exam-oriented';
  importantDeadlines: { title: string; date: string; tag: string }[];
  longTermGoals: string[];
  bio: string;
  userTier: UserTier;
  tierExpiresAt?: string;
  referralCode: string;
  upiId?: string;
}

export interface ReferralStats {
  referralCode: string;
  totalClicks: number;
  freeSignups: number;
  paidConversions: number;
  totalEarnings: number; // in INR
  pendingPayout: number; // in INR
  upiId: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  reasoningSteps?: string[];
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  category: 'general' | 'coding' | 'learning' | 'career' | 'business' | 'agent' | 'exam' | 'viva' | 'lab';
  isPinned?: boolean;
}

export type AIProvider = 'kedar-ai' | 'gemini' | 'groq' | 'openai' | 'openrouter' | 'mock' | 'supabase';

export type AgentRole = 'supervisor' | 'architect' | 'engineer' | 'auditor' | 'devops';

export interface AgentStep {
  id: string;
  agentRole?: AgentRole;
  agentName?: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  toolUsed?: string;
  output?: string;
  codeSnippet?: {
    language: string;
    code: string;
    filename?: string;
  };
}

export interface AgentDeliverable {
  id: string;
  title: string;
  type: 'code' | 'architecture' | 'docker' | 'synopsis' | 'config' | 'tasks' | 'roadmap';
  filename: string;
  language: string;
  content: string;
  actionPayload?: any;
}

export interface AgentTask {
  id: string;
  goal: string;
  category: string;
  steps: AgentStep[];
  status: 'planning' | 'running' | 'completed' | 'failed';
  finalResult?: string;
  deliverables?: AgentDeliverable[];
  createdAt: string;
}

export interface TaskItem {
  id: string;
  userId?: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category?: 'academics' | 'coding' | 'career' | 'personal' | 'project';
  status?: 'todo' | 'in_progress' | 'completed' | 'active';
  deadline: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

export type MemoryCategory = 
  | 'Profile' 
  | 'Education' 
  | 'Skills' 
  | 'Projects' 
  | 'Goals' 
  | 'Preferences' 
  | 'Other'
  | 'skills'
  | 'projects'
  | 'preferences'
  | 'career'
  | 'academic'
  | 'general';

export interface MemoryItem {
  id: string;
  userId?: string;
  content: string;
  category: MemoryCategory;
  importance?: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt?: string;
}

export interface LearningItem {
  id: string;
  roadmapId: string;
  title: string;
  description: string;
  completed: boolean;
  position: number;
  createdAt?: string;
}

export interface LearningModule {
  id: string;
  title: string;
  topics: string[];
  completed: boolean;
}

export interface LearningRoadmap {
  id: string;
  userId?: string;
  title: string;
  description: string;
  icon: string;
  estimatedWeeks: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  modules: LearningModule[];
  items?: LearningItem[];
  progress: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

export interface ResumeAnalysis {
  id: string;
  overallScore: number;
  summary: string;
  detectedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weakSections: string[];
  improvementSuggestions: string[];
  rewrittenBullets: { before: string; after: string; reason: string }[];
  createdAt: string;
}

export interface ContentPost {
  id: string;
  userId?: string;
  platform: 'linkedin' | 'twitter' | 'instagram' | 'youtube' | 'blog';
  topic: string;
  tone: 'professional' | 'casual' | 'viral' | 'educational' | 'motivational' | 'hinglish';
  generatedContent: string;
  hashtags: string[];
  createdAt: string;
}

export interface BusinessIdea {
  id: string;
  userId?: string;
  title: string;
  tagline: string;
  problem: string;
  solution: string;
  targetAudience: string;
  techStack: string[];
  monetization: string[];
  mvpPlan: { week: number; goal: string; tasks: string[] }[];
  goToAction: string[];
  createdAt: string;
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  explanation: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  createdAt: string;
}

export interface AISettings {
  provider: AIProvider;
  model: string;
  temperature: number;
  theme: 'dark' | 'light';
  autoSaveMemory: boolean;
  voiceSynthesis: boolean;
  geminiApiKey?: string;
  groqApiKey?: string;
  openaiApiKey?: string;
  openrouterApiKey?: string;
  customSystemPrompt?: string;
}
