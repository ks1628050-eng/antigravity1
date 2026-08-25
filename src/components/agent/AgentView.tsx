import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Play, CheckCircle2, Loader2, CircleDot, 
  ArrowRight, Download, Copy, Check, Terminal, FileCode,
  ShieldCheck, Layers, Cpu, RefreshCw, Box, Code2, Rocket,
  Bug, ExternalLink
} from 'lucide-react';
import { marked } from 'marked';
import Prism from 'prismjs';
import { useApp } from '../../context/AppContext';
import { agentService } from '../../services/agentService';
import { AgentTask, AgentStep, AgentDeliverable } from '../../types';

export const AgentView: React.FC = () => {
  const { profile, memories, settings, showToast, setCurrentSection } = useApp();
  const [goal, setGoal] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTask, setActiveTask] = useState<AgentTask | null>(null);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'deliverables' | 'report'>('pipeline');
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const sampleGoals = [
    'Build a real-time Portfolio Website with Next.js 15, Tailwind, and Supabase.',
    'Architect an automated AI Customer Support Bot with WhatsApp Webhook & Gemini.',
    'Build a high-throughput Chat Application with WebSockets, Redis caching, and PostgreSQL.',
    'Create an ATS 95+ Resume Optimizer CLI tool in Python with Google Gemini API.'
  ];

  useEffect(() => {
    Prism.highlightAll();
  }, [activeTask, activeTab, selectedStepIndex]);

  const handleStartAgent = async (customGoal?: string) => {
    const targetGoal = customGoal || goal;
    if (!targetGoal.trim() || isRunning) return;

    setIsRunning(true);
    showToast('Multi-Agent Swarm initializing goal analysis...', 'info');

    try {
      // Step 1: Supervisor Agent plans task breakdown
      const initialTask = await agentService.generateAgentPlan(targetGoal, { profile, memories, settings });
      initialTask.status = 'running';
      setActiveTask(initialTask);
      setActiveTab('pipeline');

      const deliverables: AgentDeliverable[] = [];
      const updatedSteps: AgentStep[] = [...initialTask.steps];

      // Step 2: Execute each specialized agent sequentially
      for (let i = 0; i < updatedSteps.length; i++) {
        setSelectedStepIndex(i);
        updatedSteps[i].status = 'in_progress';
        setActiveTask({ ...initialTask, steps: [...updatedSteps] });

        // Real agent step execution
        const { output, codeSnippet, deliverable } = await agentService.executeStep(
          initialTask,
          updatedSteps[i],
          { profile, memories, settings }
        );

        updatedSteps[i].status = 'completed';
        updatedSteps[i].output = output;
        if (codeSnippet) {
          updatedSteps[i].codeSnippet = codeSnippet;
        }
        if (deliverable) {
          deliverables.push(deliverable);
        }

        setActiveTask({
          ...initialTask,
          steps: [...updatedSteps],
          deliverables: [...deliverables]
        });
      }

      // Step 3: Compile final report
      const finalReport = agentService.generateFinalReport(
        { ...initialTask, steps: updatedSteps },
        deliverables,
        profile.name
      );

      const completedTask: AgentTask = {
        ...initialTask,
        steps: updatedSteps,
        deliverables,
        status: 'completed',
        finalResult: finalReport
      };

      setActiveTask(completedTask);
      showToast('All autonomous agent phases completed successfully!', 'success');
    } catch (err: any) {
      showToast(`Agent execution error: ${err.message || 'Execution failed'}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const copyResult = () => {
    if (!activeTask?.finalResult) return;
    navigator.clipboard.writeText(activeTask.finalResult);
    setCopied(true);
    showToast('Report copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    showToast('Code copied to clipboard!', 'success');
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const downloadProjectZip = () => {
    if (!activeTask) return;
    const report = activeTask.finalResult || '';
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-project-${activeTask.id}.md`;
    a.click();
    showToast('Agent deliverable package downloaded!', 'success');
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'architect': return <Layers className="w-4 h-4 text-cyan-400" />;
      case 'engineer': return <Code2 className="w-4 h-4 text-emerald-400" />;
      case 'auditor': return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      case 'devops': return <Rocket className="w-4 h-4 text-purple-400" />;
      default: return <Cpu className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-indigo-950/70 border border-purple-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Autonomous Multi-Agent Swarm</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">Autonomous Agent Swarm</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Give Kedar AI any high-level engineering objective. Specialized agents (Architect, Full-Stack Engineer, Security Auditor, and DevOps) collaborate to build complete production deliverables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>Swarm: 4 Agents Active</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ReAct Loop Verified</span>
          </div>
        </div>
      </div>

      {/* Goal Input Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4 shadow-xl">
        <label className="block text-sm font-semibold text-slate-200">
          What complex objective would you like the Agent Swarm to build?
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStartAgent()}
            placeholder="e.g. Architect and build an AI-powered Code Reviewer with WebSockets and FastAPI..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
          />
          <button
            onClick={() => handleStartAgent()}
            disabled={!goal.trim() || isRunning}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/25 transition-all shrink-0"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunning ? 'Swarm Executing...' : 'Deploy Agent Swarm'}</span>
          </button>
        </div>

        {/* Suggested Goals */}
        <div className="space-y-2 pt-2 border-t border-slate-800/60">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High-Yield Goal Templates:</p>
          <div className="flex flex-wrap gap-2">
            {sampleGoals.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setGoal(sample);
                  handleStartAgent(sample);
                }}
                disabled={isRunning}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors text-left disabled:opacity-50"
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
          
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              {[
                { id: 'pipeline', label: 'Agent Pipeline' },
                { id: 'deliverables', label: `Deliverables (${activeTask.deliverables?.length || 0})` },
                { id: 'report', label: 'Composite Report' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                activeTask.status === 'completed' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
              }`}>
                {activeTask.status === 'completed' ? '✓ Swarm Finished' : '⚡ Swarm Active'}
              </span>

              {activeTask.status === 'completed' && (
                <button
                  onClick={downloadProjectZip}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Package</span>
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: PIPELINE & STEP INSPECTOR */}
          {activeTab === 'pipeline' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Step Sequence (5 Cols) */}
              <div className="lg:col-span-5 space-y-3">
                {activeTask.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    onClick={() => setSelectedStepIndex(idx)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      selectedStepIndex === idx
                        ? 'bg-purple-950/40 border-purple-500/70 shadow-lg shadow-purple-950/40 text-white'
                        : step.status === 'completed'
                        ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                        : step.status === 'in_progress'
                        ? 'bg-indigo-950/30 border-indigo-500/50 text-slate-100'
                        : 'bg-slate-950/50 border-slate-900 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(step.agentRole)}
                        <span className="text-xs font-bold">{step.agentName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {step.status === 'completed' && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Done</span>}
                        {step.status === 'in_progress' && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 animate-pulse">Running</span>}
                        {step.status === 'pending' && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-500">Queued</span>}
                      </div>
                    </div>

                    <h4 className="text-sm font-semibold leading-snug">{step.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{step.description}</p>
                  </div>
                ))}
              </div>

              {/* Right Column: Step Output Inspector (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                {activeTask.steps[selectedStepIndex] ? (
                  <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(activeTask.steps[selectedStepIndex].agentRole)}
                        <h3 className="font-display font-bold text-sm text-white">
                          {activeTask.steps[selectedStepIndex].title}
                        </h3>
                      </div>

                      {activeTask.steps[selectedStepIndex].codeSnippet && (
                        <button
                          onClick={() => copyCode(activeTask.steps[selectedStepIndex].codeSnippet!.code, `step-${selectedStepIndex}`)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
                        >
                          {copiedCodeId === `step-${selectedStepIndex}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copy Code</span>
                        </button>
                      )}
                    </div>

                    {activeTask.steps[selectedStepIndex].status === 'in_progress' && !activeTask.steps[selectedStepIndex].output && (
                      <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
                        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                        <p className="text-xs font-mono">Agent synthesizing code & specs in real-time...</p>
                      </div>
                    )}

                    {activeTask.steps[selectedStepIndex].output ? (
                      <div 
                        className="markdown-content text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800/80 overflow-x-auto max-h-[500px] overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: (marked.parse(activeTask.steps[selectedStepIndex].output || '', { async: false }) as string) || activeTask.steps[selectedStepIndex].output! }}
                      />
                    ) : activeTask.steps[selectedStepIndex].status === 'pending' ? (
                      <div className="py-12 text-center text-xs text-slate-500 font-mono">
                        This phase will execute once prior steps complete.
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                    Select a step from the left pipeline to inspect its output.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DELIVERABLES */}
          {activeTab === 'deliverables' && (
            <div className="space-y-4">
              {activeTask.deliverables && activeTask.deliverables.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTask.deliverables.map((deliv, idx) => (
                    <div key={deliv.id || idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-emerald-400" />
                          <span className="font-mono text-xs font-bold text-white">{deliv.filename}</span>
                        </div>
                        <button
                          onClick={() => copyCode(deliv.content, deliv.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Copy file content"
                        >
                          {copiedCodeId === deliv.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-60">
                        <code>{deliv.content.slice(0, 500)}{deliv.content.length > 500 ? '\n... (truncated)' : ''}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                  Deliverables will populate here as the agents finish generating code files.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMPOSITE REPORT */}
          {activeTab === 'report' && activeTask.finalResult && (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
                  <Box className="w-4 h-4 text-indigo-400" />
                  <span>Full Project Architecture & Release Specification</span>
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyResult}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={downloadProjectZip}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Markdown</span>
                  </button>
                </div>
              </div>

              <div 
                className="markdown-content text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950 p-6 rounded-xl border border-slate-800/80 max-h-[600px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: (marked.parse(activeTask.finalResult || '', { async: false }) as string) || activeTask.finalResult }}
              />
            </div>
          )}

        </div>
      )}
    </div>
  );
};
