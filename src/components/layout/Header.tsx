import React, { useState } from 'react';
import { 
  Menu, Sun, Moon, Sparkles, Volume2, 
  VolumeX, Bot, Bell, Search, Command, Crown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { speechService } from '../../services/speechService';
import { PricingModal } from '../monetization/PricingModal';
import { CheckoutModal } from '../monetization/CheckoutModal';

const sectionTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Personal Dashboard', subtitle: 'Overview of your productivity, goals, and AI intelligence' },
  chat: { title: 'AI Chat Assistant', subtitle: 'Context-aware intelligence with real-time memory' },
  agent: { title: 'Autonomous Agent Mode', subtitle: 'Multi-step goal decomposition and automated execution' },
  'exam-solver': { title: '10-Mark University Exam Solver', subtitle: 'Structured university answers with diagrams and scoring rubrics' },
  'viva-simulator': { title: 'Live Voice Viva Voce Examiner', subtitle: 'Audible rapid-fire questions, voice answering & instant scoring' },
  'lab-record': { title: 'Lab Record & Practical Manual', subtitle: 'Printable college practicals with Aim, Code, and Viva Q&As' },
  'project-architect': { title: 'Capstone Project & Thesis Architect', subtitle: 'IEEE synopsis, system architecture diagrams, and milestones' },
  tasks: { title: 'Task & Daily Planner', subtitle: 'Intelligent scheduling with Plan My Day AI' },
  learning: { title: 'Learning Roadmaps & Quizzes', subtitle: 'Curated roadmaps, topic deep-dives, and practice tests' },
  coding: { title: 'Coding Studio & Big-O', subtitle: 'Multi-language generation, debugging, and Big-O optimization' },
  career: { title: 'Career & Resume Coach', subtitle: 'ATS 90+ resume analyzer, mock interviews, and skill gap checker' },
  content: { title: 'Content Studio', subtitle: 'Viral LinkedIn, X/Twitter, and YouTube scripts across 6 tones' },
  business: { title: 'Business Idea Generator', subtitle: 'Micro-SaaS architectures, monetization, and 4-week MVP roadmaps' },
  affiliate: { title: 'Campus Ambassador & Revenue Hub', subtitle: 'Earn 30% recurring cash commission on every referred student' },
  memory: { title: 'AI Memory Vault', subtitle: 'Personal facts, preferences, and project context stored in AI brain' },
  settings: { title: 'Settings & Profile', subtitle: 'Configure AI models, API keys, and personal profile' },
};

export const Header: React.FC = () => {
  const { 
    currentSection, 
    setCurrentSection, 
    settings, 
    updateSettings, 
    setIsMobileSidebarOpen,
    profile
  } = useApp();

  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number; period: string } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const currentInfo = sectionTitles[currentSection] || { title: 'Kedar AI', subtitle: 'B.Tech Super Copilot' };

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const toggleVoice = () => {
    if (speechService.isSpeaking()) {
      speechService.stopSpeaking();
    }
    updateSettings({ voiceSynthesis: !settings.voiceSynthesis });
  };

  const handleSelectPlan = (plan: { name: string; price: number; period: string }) => {
    setSelectedPlan(plan);
    setIsPricingOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3.5 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
        {/* Left: Mobile Toggle & Section Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 lg:hidden border border-slate-800"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="font-display font-bold text-lg lg:text-xl text-slate-100 tracking-tight flex items-center gap-2">
              {currentInfo.title}
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Status Pills & Action Tools */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* PRO Badge / Upgrade Trigger */}
          <button
            onClick={() => setIsPricingOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 border border-amber-500/40 shadow-sm transition-all active:scale-95"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>PRO ACTIVE</span>
          </button>

          {/* Active AI Engine Badge */}
          <div 
            onClick={() => setCurrentSection('settings')}
            className="cursor-pointer hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/90 hover:bg-slate-850 border border-slate-700/60 text-slate-300 transition-colors shadow-sm"
          >
            <div className={`w-2 h-2 rounded-full ${settings.provider !== 'mock' ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'}`} />
            <span className="font-mono">
              {settings.provider === 'gemini' ? 'Gemini 1.5 Flash' : settings.provider === 'openai' ? 'OpenAI GPT-4o' : 'Smart Offline Brain'}
            </span>
          </div>

          {/* Voice Toggle */}
          <button
            onClick={toggleVoice}
            title={settings.voiceSynthesis ? 'Voice Synthesis Enabled' : 'Voice Muted'}
            className={`p-2 rounded-xl border transition-all ${
              settings.voiceSynthesis 
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {settings.voiceSynthesis ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle Dark/Light Mode"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </header>

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSelectPlan={handleSelectPlan}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        plan={selectedPlan}
      />
    </>
  );
};
