import React, { useState } from 'react';
import { 
  Sparkles, Play, CheckCircle2, Loader2, CircleDot, 
  ArrowRight, Download, Copy, Check, Terminal, FileCode,
  ShieldCheck, Layers, Cpu, RefreshCw
} from 'lucide-react';
import { marked } from 'marked';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { AgentTask, AgentStep } from '../../types';

export const AgentView: React.FC = () => {
  const { profile, memories, settings, showToast } = useApp();
  const [goal, setGoal] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTask, setActiveTask] = useState<AgentTask | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleGoals = [
    'Help me build a portfolio website with Next.js 15, Tailwind, and Supabase.',
    'Architect an automated AI Customer Support Bot with WhatsApp Webhook & Gemini.',
    'Build a full-stack real-time Chat application with WebSockets and Redis caching.',
    'Create an ATS Resume Optimizer CLI tool in Python with Google Gemini API.'
  ];

  const handleStartAgent = async (customGoal?: string) => {
    const targetGoal = customGoal || goal;
    if (!targetGoal.trim() || isRunning) return;

    setIsRunning(true);
    showToast('Agent initializing goal decomposition...', 'info');

    try {
      // Step 1: Generate initial plan
      const task = await aiService.generateAgentPlan(targetGoal, { profile, memories, settings });
      
      // Simulate live progressive step execution
      const initialTask: AgentTask = {
        ...task,
        status: 'running',
        steps: task.steps.map((s, idx) => ({
          ...s,
          status: idx === 0 ? 'in_progress' : 'pending'
        }))
      };
      setActiveTask(initialTask);

      // Execute steps sequentially with visual state transition
      for (let i = 0; i < initialTask.steps.length; i++) {
        await new Promise(r => setTimeout(r, 800));
        
        setActiveTask(prev => {
          if (!prev) return null;
          const updatedSteps = prev.steps.map((s, idx) => {
            if (idx === i) return { ...s, status: 'completed' as const };
            if (idx === i + 1) return { ...s, status: 'in_progress' as const };
            return s;
          });
          return { ...prev, steps: updatedSteps };
        });
      }

      // Mark final task completion
      setActiveTask(prev => prev ? { ...prev, status: 'completed' } : null);
      showToast('Agent goal executed successfully!', 'success');
    } catch (err: any) {
      showToast(`Agent error: ${err.message || 'Failed to execute'}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const copyResult = () => {
    if (!activeTask?.finalResult) return;
    navigator.clipboard.writeText(activeTask.finalResult);
    setCopied(true);
    showToast('Result copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = () => {
    if (!activeTask) return;
    const blob = new Blob([activeTask.finalResult || ''], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-plan-${activeTask.id}.md`;
    a.click();
    showToast('Plan report downloaded!', 'success');
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-indigo-950/70 border border-purple-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Autonomous Goal Orchestrator</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">AI Agent Mode</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Give Kedar AI any complex objective. The agent will formulate a multi-tier action plan, simulate tool executions, and produce production deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>ReAct Loop: Active</span>
          </div>
        </div>
      </div>

      {/* Goal Input Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
        <label className="block text-sm font-semibold text-slate-200">
          What would you like the Agent to accomplish?
        </label>

        <div className="flex gap-3">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStartAgent()}
            placeholder="e.g. Help me build a portfolio website with Next.js and Tailwind..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm text-slate-100 placeholder-slate-500 outline-none"
          />
          <button
            onClick={() => handleStartAgent()}
            disabled={!goal.trim() || isRunning}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/25 transition-all"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunning ? 'Executing...' : 'Run Agent'}</span>
          </button>
        </div>

        {/* Suggested Goals */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Example Goal Templates:</p>
          <div className="flex flex-wrap gap-2">
            {sampleGoals.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setGoal(sample);
                  handleStartAgent(sample);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors text-left"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Live Execution Visualization */}
      {activeTask && (
        <div className="space-y-6">
          
          {/* Execution Pipeline Steps */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                <span>Execution Steps ({activeTask.steps.filter(s => s.status === 'completed').length}/{activeTask.steps.length})</span>
              </h3>
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                activeTask.status === 'completed' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
              }`}>
                {activeTask.status}
              </span>
            </div>

            <div className="space-y-3">
              {activeTask.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border transition-all ${
                    step.status === 'completed'
                      ? 'bg-slate-950/80 border-emerald-500/30 text-slate-200'
                      : step.status === 'in_progress'
                      ? 'bg-purple-950/30 border-purple-500/50 text-white shadow-lg shadow-purple-950/40'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {step.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                      {step.status === 'in_progress' && <Loader2 className="w-5 h-5 text-purple-400 animate-spin shrink-0" />}
                      {step.status === 'pending' && <CircleDot className="w-5 h-5 text-slate-600 shrink-0" />}
                      <div>
                        <p className="text-sm font-semibold">{step.title}</p>
                        <p className="text-xs text-slate-400">{step.description}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      Step {idx + 1}
                    </span>
                  </div>

                  {step.output && (
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-emerald-300">
                      ➜ {step.output}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Final Deliverable Report */}
          {activeTask.status === 'completed' && activeTask.finalResult && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="font-display font-semibold text-lg text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-indigo-400" />
                  <span>Agent Deliverable Artifact</span>
                </h3>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyResult}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={downloadReport}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Report</span>
                  </button>
                </div>
              </div>

              <div 
                className="markdown-content text-sm text-slate-200 leading-relaxed bg-slate-950 p-5 rounded-xl border border-slate-800/80"
                dangerouslySetInnerHTML={{ __html: marked.parse(activeTask.finalResult) as string }}
              />
            </div>
          )}

        </div>
      )}
    </div>
  );
};
