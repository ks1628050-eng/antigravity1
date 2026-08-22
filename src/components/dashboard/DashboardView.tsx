import React from 'react';
import { 
  Sparkles, CheckCircle2, Clock, Flame, Brain, 
  ArrowUpRight, Code2, Briefcase, GraduationCap, 
  Lightbulb, Calendar, Plus, MessageSquare, Play,
  Volume2, FileCode, Rocket, HeartHandshake, Crown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const { 
    profile, 
    tasks, 
    toggleTask, 
    roadmaps, 
    conversations, 
    setCurrentSection, 
    setActiveConversationId,
    createConversation,
    memories
  } = useApp();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  const startQuickChat = (prompt: string, category: any = 'general') => {
    const convId = createConversation(prompt.slice(0, 30) + '...', category);
    setActiveConversationId(convId);
    setCurrentSection('chat');
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      
      {/* 1. Hero Banner with AI Personal Greeting & Pro Badge */}
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 bg-gradient-to-br from-indigo-950/90 via-slate-900/90 to-purple-950/80 border border-indigo-500/30 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Student Pro Super Copilot Active</span>
            </div>
            <h2 className="text-2xl lg:text-4xl font-display font-bold text-white tracking-tight">
              {greeting}, {profile.name.split(' ')[0]} 👋
            </h2>
            <p className="text-slate-300 text-xs lg:text-sm leading-relaxed">
              Targeting <span className="text-indigo-400 font-semibold">{profile.targetRole}</span> • {profile.education} ({profile.currentSemester})
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setCurrentSection('viva-simulator')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-md shadow-purple-600/30 transition-all active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
              <span>Voice Viva Voce</span>
            </button>

            <button
              onClick={() => setCurrentSection('exam-solver')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <GraduationCap className="w-4 h-4" />
              <span>10-Mark Exam Solver</span>
            </button>
          </div>
        </div>

        {/* AI Real-Time Suggestion Pill */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-start sm:items-center gap-3 text-slate-300 text-xs lg:text-sm">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <p className="flex-1">
            <strong className="text-indigo-300 font-semibold">AI Academic Focus: </strong> 
            Upcoming lab submissions detected. Auto-generate your <span className="text-white font-medium">OS Banker's Algorithm Lab Record</span> and practice 3 <span className="text-white font-medium">Viva Questions</span> with oral speech.
          </p>
        </div>

        {/* Glow Orbs */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Quick Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{completedTasks.length} <span className="text-xs text-slate-400 font-normal">/ {tasks.length}</span></p>
            <p className="text-xs text-slate-400 font-medium">Tasks Completed</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">14 <span className="text-xs text-slate-400 font-normal">Days</span></p>
            <p className="text-xs text-slate-400 font-medium">Study & Code Streak</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400">₹3,600</p>
            <p className="text-xs text-slate-400 font-medium">Referral Revenue</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">88 <span className="text-xs text-slate-400 font-normal">/100</span></p>
            <p className="text-xs text-slate-400 font-medium">ATS Resume Score</p>
          </div>
        </div>
      </div>

      {/* 3. 4-Card B.Tech Super Suite Launchers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          onClick={() => setCurrentSection('exam-solver')}
          className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900/80 border border-indigo-500/30 hover:border-indigo-500/60 cursor-pointer transition-all space-y-2 group shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <h4 className="font-bold text-sm text-white">10-Mark Exam Solver</h4>
          <p className="text-[11px] text-slate-400">VTU/JNTU/SPPU semester questions with diagrams & derivations.</p>
        </div>

        <div 
          onClick={() => setCurrentSection('viva-simulator')}
          className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900/80 border border-purple-500/30 hover:border-purple-500/60 cursor-pointer transition-all space-y-2 group shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <h4 className="font-bold text-sm text-white">Live Voice Viva Examiner</h4>
          <p className="text-[11px] text-slate-400">Audible questioning & speech answers with instant /10 scoring.</p>
        </div>

        <div 
          onClick={() => setCurrentSection('lab-record')}
          className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900/80 border border-blue-500/30 hover:border-blue-500/60 cursor-pointer transition-all space-y-2 group shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <FileCode className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <h4 className="font-bold text-sm text-white">Lab Record Generator</h4>
          <p className="text-[11px] text-slate-400">Aim, Theory, Algorithm, Code, Sample I/O & Viva Q&As.</p>
        </div>

        <div 
          onClick={() => setCurrentSection('affiliate')}
          className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900/80 border border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer transition-all space-y-2 group shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <h4 className="font-bold text-sm text-white">Campus Ambassador Hub</h4>
          <p className="text-[11px] text-slate-400">Earn 30% recurring cash commission on student referrals.</p>
        </div>

      </div>

      {/* 4. Main Tasks & Deadlines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Tasks */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-display font-semibold text-lg text-white">Today's Focus Tasks</h3>
              </div>
              <button
                onClick={() => setCurrentSection('tasks')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>View All ({pendingTasks.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        task.isCompleted 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-slate-700 hover:border-indigo-500'
                      }`}
                    >
                      {task.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-200 group-hover:text-white'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{task.description}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                    task.priority === 'high' 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                      : task.priority === 'medium'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Academic Deadlines */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-semibold text-lg text-white">Upcoming Deadlines & Milestones</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.importantDeadlines.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.tag}
                    </span>
                    <p className="text-sm font-medium text-slate-200 mt-1.5">{item.title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono font-semibold text-amber-400">{item.date}</p>
                    <p className="text-[10px] text-slate-500">Deadline</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Learning Roadmaps & AI Actions */}
        <div className="space-y-6">
          
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-400" />
                <h3 className="font-display font-semibold text-lg text-white">Learning Roadmaps</h3>
              </div>
              <button
                onClick={() => setCurrentSection('learning')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Explore
              </button>
            </div>

            <div className="space-y-4">
              {roadmaps.map((roadmap) => (
                <div 
                  key={roadmap.id} 
                  onClick={() => setCurrentSection('learning')}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/40 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-200">{roadmap.title}</p>
                    <span className="text-xs font-mono font-bold text-purple-400">{roadmap.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${roadmap.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-4">
            <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyber-blue" />
              <span>Quick AI Launchers</span>
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => setCurrentSection('viva-simulator')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 text-xs text-slate-300 hover:text-white transition-colors flex items-center justify-between"
              >
                <span>🎙️ Start Audio Viva Practice</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setCurrentSection('lab-record')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 text-xs text-slate-300 hover:text-white transition-colors flex items-center justify-between"
              >
                <span>📑 Auto-Generate Lab Practical</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setCurrentSection('project-architect')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 text-xs text-slate-300 hover:text-white transition-colors flex items-center justify-between"
              >
                <span>🚀 Build Capstone Project IEEE Plan</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
