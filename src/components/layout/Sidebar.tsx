import React, { useState } from 'react';
import { 
  LayoutDashboard, MessageSquare, Sparkles, CheckSquare, 
  GraduationCap, Code2, Briefcase, PenTool, Lightbulb, 
  Brain, Settings, Plus, X, ShieldCheck, Zap, Volume2,
  FileCode, Rocket, HeartHandshake, Crown, ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavSection } from '../../types';
import { PricingModal } from '../monetization/PricingModal';
import { CheckoutModal } from '../monetization/CheckoutModal';

interface NavItem {
  id: NavSection;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { 
    currentSection, 
    setCurrentSection, 
    createConversation, 
    tasks, 
    memories,
    profile,
    isMobileSidebarOpen, 
    setIsMobileSidebarOpen 
  } = useApp();

  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number; period: string } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const pendingTasksCount = tasks.filter(t => !t.isCompleted).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'chat', label: 'AI Assistant', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'agent', label: 'Agent Mode', icon: <Sparkles className="w-4 h-4 text-cyber-purple" />, badge: 'AUTONOMOUS', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    
    // Academic Suite for B.Tech
    { id: 'exam-solver', label: '10-Mark Exam Solver', icon: <GraduationCap className="w-4 h-4 text-indigo-400" />, badge: 'VTU/JNTU', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    { id: 'viva-simulator', label: 'Voice Viva Examiner', icon: <Volume2 className="w-4 h-4 text-purple-400" />, badge: 'AUDIO', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { id: 'lab-record', label: 'Lab Record Generator', icon: <FileCode className="w-4 h-4 text-blue-400" />, badge: 'PRINT', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { id: 'project-architect', label: 'Capstone Project', icon: <Rocket className="w-4 h-4 text-cyan-400" /> },
    
    // Core Engineering & Productivity
    { id: 'tasks', label: 'Task Planner', icon: <CheckSquare className="w-4 h-4" />, badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : undefined, badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { id: 'learning', label: 'Learning Roadmaps', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'coding', label: 'Coding Studio', icon: <Code2 className="w-4 h-4" /> },
    { id: 'career', label: 'Career & Resume', icon: <Briefcase className="w-4 h-4" />, badge: 'ATS 90+', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { id: 'content', label: 'Content Studio', icon: <PenTool className="w-4 h-4" /> },
    { id: 'business', label: 'Business Ideas', icon: <Lightbulb className="w-4 h-4" /> },
    
    // Revenue & System
    { id: 'affiliate', label: 'Campus Ambassador', icon: <HeartHandshake className="w-4 h-4 text-emerald-400" />, badge: 'EARN ₹', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { id: 'memory', label: 'Memory Vault', icon: <Brain className="w-4 h-4" />, badge: `${memories.length}`, badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleNavClick = (section: NavSection) => {
    setCurrentSection(section);
    setIsMobileSidebarOpen(false);
  };

  const handleNewChat = () => {
    createConversation('New Chat');
    setCurrentSection('chat');
    setIsMobileSidebarOpen(false);
  };

  const handleSelectPlan = (plan: { name: string; price: number; period: string }) => {
    setSelectedPlan(plan);
    setIsPricingOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-72 flex flex-col
        bg-slate-950/95 backdrop-blur-2xl border-r border-slate-800/80
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* App Branding */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/25">
              <Zap className="w-4 h-4 text-white animate-pulse" />
              <div className="absolute inset-0 rounded-xl border border-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-base tracking-tight text-white">Kedar AI</span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">B.Tech Super Copilot</p>
            </div>
          </div>
          <button 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button: New Chat */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl font-medium text-xs text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/25 transition-all duration-200 active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto py-1">
          {navItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium
                  transition-all duration-150 group relative
                  ${isActive 
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'}
                `}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-indigo-500 shadow-glow" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Monetization / Pro Upgrade Banner */}
        <div className="p-3 border-t border-slate-800/60 bg-slate-950/80 space-y-2">
          <div 
            onClick={() => setIsPricingOpen(true)}
            className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-[11px] font-bold text-white">Student Pro Active</p>
                <p className="text-[10px] text-amber-300/80">₹199 / Month Tier</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
          </div>

          {/* User Mini Profile */}
          <div 
            onClick={() => handleNavClick('settings')}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-900/80 cursor-pointer transition-colors"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center font-bold text-xs text-white shadow-inner">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{profile.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{profile.targetRole.split('/')[0]}</p>
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          </div>
        </div>
      </aside>

      {/* Pricing & Checkout Modals */}
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
