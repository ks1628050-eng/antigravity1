import React, { useState } from 'react';
import { 
  Lightbulb, Sparkles, Rocket, Target, DollarSign, 
  Layers, CheckCircle2, ArrowRight, Download, Trash2,
  TrendingUp, ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { BusinessIdea } from '../../types';

export const BusinessView: React.FC = () => {
  const { profile, memories, settings, businessIdeas, addBusinessIdea, deleteBusinessIdea, showToast } = useApp();
  
  const [inputSkills, setInputSkills] = useState(profile.skills.slice(0, 5).join(', '));
  const [industry, setIndustry] = useState('Developer Tools & AI Productivity');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<BusinessIdea>(businessIdeas[0] || null);

  const handleGenerateIdea = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    showToast('AI is synthesizing a high-margin Micro-SaaS blueprint...', 'info');

    try {
      const newIdea = await aiService.generateBusinessIdea(
        inputSkills,
        industry,
        { profile, memories, settings }
      );

      addBusinessIdea(newIdea);
      setSelectedIdea(newIdea);
      showToast('Business Blueprint generated & saved!', 'success');
    } catch (err) {
      showToast('Failed to generate business idea', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBlueprint = (idea: BusinessIdea) => {
    const md = `# ${idea.title}
*${idea.tagline}*

## Problem Statement
${idea.problem}

## Solution & UVP
${idea.solution}

## Target Audience
${idea.targetAudience}

## Technology Stack
${idea.techStack.map(s => `- ${s}`).join('\n')}

## Monetization Model
${idea.monetization.map(m => `- ${m}`).join('\n')}

## 4-Week MVP Roadmap
${idea.mvpPlan.map(p => `### Week ${p.week}: ${p.goal}\n${p.tasks.map(t => `- [ ] ${t}`).join('\n')}`).join('\n\n')}

## Go-to-Market Actions
${idea.goToAction.map(a => `- ${a}`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${idea.title.toLowerCase().replace(/\s+/g, '-')}-blueprint.md`;
    a.click();
    showToast('Downloaded blueprint!', 'success');
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900/90 to-purple-950/70 border border-amber-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Rocket className="w-3.5 h-3.5" />
            <span>Micro-SaaS & Venture Blueprint</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">Business Idea & MVP Architect</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Turn your technical skills ({profile.skills.slice(0, 4).join(', ')}) into profitable Micro-SaaS businesses with 4-week execution plans.
          </p>
        </div>

        <button
          onClick={handleGenerateIdea}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? 'Synthesizing...' : 'Generate New SaaS Idea'}</span>
        </button>
      </div>

      {/* Main Grid: Vault on Left, Blueprint on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Saved Ideas List (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Startup Blueprints ({businessIdeas.length}):</h3>
          <div className="space-y-3">
            {businessIdeas.map((idea) => (
              <div
                key={idea.id}
                onClick={() => setSelectedIdea(idea)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 relative group ${
                  selectedIdea?.id === idea.id
                    ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-950/40'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-white truncate pr-6">{idea.title}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBusinessIdea(idea.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{idea.tagline}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    {idea.techStack[0]}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    {idea.techStack[1]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Blueprint Deep-Dive (8 Cols) */}
        {selectedIdea && (
          <div className="lg:col-span-8 p-6 lg:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
            
            {/* Header with Title & Download */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h3 className="text-2xl font-display font-bold text-white">{selectedIdea.title}</h3>
                <p className="text-sm text-amber-300/90 mt-0.5 font-medium">{selectedIdea.tagline}</p>
              </div>

              <button
                onClick={() => downloadBlueprint(selectedIdea)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors shrink-0 shadow-md shadow-indigo-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Download Blueprint</span>
              </button>
            </div>

            {/* Problem & Solution Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  <span>The Pain Point</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedIdea.problem}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>The Solution & UVP</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedIdea.solution}</p>
              </div>
            </div>

            {/* Target Audience & Stack */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Customer Base:</span>
              <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800">{selectedIdea.targetAudience}</p>
            </div>

            {/* Monetization Models */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Monetization & Pricing Strategy</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedIdea.monetization.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    {m}
                  </div>
                ))}
              </div>
            </div>

            {/* 4-Week MVP Action Roadmap */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>4-Week MVP Execution Plan</span>
              </span>
              <div className="space-y-2.5">
                {selectedIdea.mvpPlan.map((week) => (
                  <div key={week.week} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 shrink-0">
                      W{week.week}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{week.goal}</p>
                      <ul className="text-[11px] text-slate-400 mt-1 space-y-0.5">
                        {week.tasks.map((t, tIdx) => (
                          <li key={tIdx}>• {t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
