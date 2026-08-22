import React, { useState } from 'react';
import { 
  Rocket, Sparkles, Copy, Check, Download, 
  FileText, Layers, Target, ShieldCheck, Database
} from 'lucide-react';
import { marked } from 'marked';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';

export const ProjectArchitectView: React.FC = () => {
  const { profile, memories, settings, showToast } = useApp();
  
  const [domain, setDomain] = useState('Autonomous AI & Full Stack Systems');
  const [projectTitle, setProjectTitle] = useState('Decentralized AI Agent Swarm for Autonomous Cyber Threat Intelligence');
  const [isGenerating, setIsGenerating] = useState(false);
  const [blueprint, setBlueprint] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleProjects = [
    'Autonomous Multi-Agent AI System for Real-Time Medical Diagnosis & Triage',
    'High-Throughput Distributed Cache with Raft Consensus in Go & Rust',
    'AI-Powered Code Reviewer with Static AST Analysis & Automated PR Patches',
    'IoT & Computer Vision Based Autonomous Drone for Precision Agriculture'
  ];

  const handleGenerate = async (customTitle?: string) => {
    const target = customTitle || projectTitle;
    if (!target.trim() || isGenerating) return;

    setIsGenerating(true);
    showToast('Architecting complete Final Year Capstone Project blueprint...', 'info');

    const prompt = `Architect a complete, publishable Final Year / Capstone B.Tech Engineering Project Blueprint:
Project Title: "${target}"
Domain: ${domain}
Lead Student: ${profile.name}

Generate the complete blueprint:
1. **ABSTRACT & NOVEL PROBLEM STATEMENT**
2. **EXISTING SYSTEM LIMITATIONS VS PROPOSED SYSTEM ARCHITECTURE**
3. **SYSTEM ARCHITECTURE & BLOCK DIAGRAM (ASCII / Flow)**
4. **RECOMMENDED TECH STACK & MODULE BREAKDOWN**
5. **DATABASE SCHEMA & KEY API CONTRACTS**
6. **IEEE-FORMAT PROJECT SYNOPSIS (With Objectives, Scope, and Methodology)**
7. **12-WEEK IMPLEMENTATION MILESTONE ROADMAP**
8. **EXPECTED RESEARCH OUTCOMES & PPT SLIDE STRUCTURE (10 Slides)**`;

    try {
      const result = await aiService.generateChatResponse(
        prompt,
        [],
        { profile, memories, settings }
      );
      setBlueprint(result);
      showToast('Capstone Project Blueprint generated!', 'success');
    } catch (err) {
      showToast('Failed to architect project', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyBlueprint = () => {
    if (!blueprint) return;
    navigator.clipboard.writeText(blueprint);
    setCopied(true);
    showToast('Project blueprint copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = () => {
    if (!blueprint) return;
    const blob = new Blob([blueprint], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `capstone-synopsis-${projectTitle.slice(0, 20).replace(/\s+/g, '-')}.md`;
    a.click();
    showToast('Downloaded Project Synopsis!', 'success');
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-indigo-950/70 border border-purple-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            <Rocket className="w-3.5 h-3.5" />
            <span>Capstone Project & IEEE Synopsis Architect</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">Capstone Project Architect</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Generate standout Minor and Final Year Capstone projects with IEEE synopsis, system architecture diagrams, database schemas, and 12-week milestones.
          </p>
        </div>

        <button
          onClick={() => handleGenerate()}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/25 transition-all active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? 'Architecting...' : 'Build Project Blueprint'}</span>
        </button>
      </div>

      {/* Input Form */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Domain / Track</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-purple-500"
            >
              <option value="Autonomous AI & Full Stack Systems">Autonomous AI & Full Stack Systems</option>
              <option value="Machine Learning & Computer Vision">Machine Learning & Computer Vision</option>
              <option value="Cloud Computing & Distributed Systems">Cloud Computing & Distributed Systems</option>
              <option value="Cybersecurity & Blockchain">Cybersecurity & Blockchain</option>
              <option value="IoT & Embedded Robotics">IoT & Embedded Robotics</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Title *</label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Project Templates */}
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">High-Scoring Project Templates:</p>
          <div className="flex flex-wrap gap-2">
            {sampleProjects.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setProjectTitle(p);
                  handleGenerate(p);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-colors text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blueprint Output */}
      {blueprint && (
        <div className="p-6 lg:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6 animate-scaleUp">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 uppercase">
              IEEE Capstone Synopsis & Architecture
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={copyBlueprint}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={downloadReport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors shadow-md shadow-indigo-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Synopsis</span>
              </button>
            </div>
          </div>

          <div 
            className="markdown-content text-sm text-slate-200 leading-relaxed bg-slate-950 p-6 rounded-2xl border border-slate-800/80"
            dangerouslySetInnerHTML={{ __html: marked.parse(blueprint) as string }}
          />
        </div>
      )}

    </div>
  );
};
