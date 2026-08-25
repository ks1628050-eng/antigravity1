import React, { useState } from 'react';
import { 
  Briefcase, FileBadge, Sparkles, CheckCircle2, AlertCircle, 
  ArrowRight, Award, Upload, Copy, Check, Target, TrendingUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { ResumeAnalysis } from '../../types';

export const CareerView: React.FC = () => {
  const { profile, memories, settings, showToast } = useApp();
  
  const [resumeText, setResumeText] = useState(`KEDAR SWAMI
Computer Science Engineering (AI & Data Science)
Email: kedar.swami@example.com | GitHub: github.com/ks1628050-eng | LinkedIn: linkedin.com/in/kedarswami

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, C++, SQL
Frameworks & Libraries: React, Next.js, Node.js, FastAPI, Tailwind CSS
Databases & Tools: PostgreSQL, Supabase, Git, Docker Basics

PROJECTS
Kedar AI — Autonomous Multi-Persona AI Copilot
- Built an AI assistant using React, TypeScript, and Google Gemini API.
- Implemented real-time token streaming and voice recognition.
- Integrated task planner and resume analyzer tools.

Campus Connect — Student Collaboration Portal
- Developed a web app for students to share notes and project ideas.
- Used Next.js and PostgreSQL for backend storage.`);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    showToast('AI is performing deep ATS keyword & impact audit...', 'info');

    try {
      const result = await aiService.analyzeResume(resumeText, profile.targetRole, { profile, memories, settings });
      setAnalysis(result);
      showToast('Resume audit completed with ATS Score!', 'success');
    } catch (err) {
      showToast('Failed to analyze resume', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    showToast('Rewritten bullet copied!', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-indigo-950/70 border border-emerald-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Career Accelerator & Placement Prep</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">Career & Resume Coach</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Targeting <strong className="text-emerald-400">{profile.targetRole}</strong>. Audit your resume against tier-1 ATS filters and generate high-impact XYZ bullet points.
          </p>
        </div>

        <button
          onClick={handleAnalyzeResume}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isAnalyzing ? 'Auditing...' : 'Run ATS Audit'}</span>
        </button>
      </div>

      {/* Main Grid: Resume Input & ATS Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Resume Text Box (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
                <FileBadge className="w-4 h-4 text-emerald-400" />
                <span>Resume Content (Paste or Edit)</span>
              </h3>
              <span className="text-xs text-slate-400">ATS Plaintext</span>
            </div>

            <textarea
              rows={18}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your full resume text here..."
              className="w-full p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 focus:border-emerald-500 outline-none resize-none leading-relaxed"
            />

            <button
              onClick={handleAnalyzeResume}
              disabled={isAnalyzing}
              className="w-full py-3 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20"
            >
              Analyze Resume Keywords
            </button>
          </div>
        </div>

        {/* Right: Analysis Results & Scores (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {analysis ? (
            <div className="space-y-6 animate-scaleUp">
              
              {/* ATS Score Header Card */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall ATS Score</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-display font-extrabold text-emerald-400">{analysis.overallScore}</span>
                    <span className="text-sm font-semibold text-slate-400">/ 100</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">{analysis.summary}</p>
                </div>

                <div className="w-24 h-24 rounded-full border-4 border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center font-display font-bold text-xl text-emerald-300 shrink-0 shadow-glow">
                  {analysis.overallScore}%
                </div>
              </div>

              {/* Detected Skills vs Missing Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Detected Keywords</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.detectedSkills.map((s, i) => (
                      <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Recommended Skills to Add</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missingSkills.map((s, i) => (
                      <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Bullet Point Rewrites (Google XYZ Formula) */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h4 className="font-display font-semibold text-sm text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>AI High-Impact Bullet Rewrites (Google XYZ Formula)</span>
                </h4>

                <div className="space-y-4">
                  {analysis.rewrittenBullets.map((b, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Original:</span>
                        <p className="text-xs text-slate-400 line-through mt-0.5">{b.before}</p>
                      </div>

                      <div className="pt-1">
                        <span className="text-[10px] uppercase font-bold text-emerald-400">High-Impact Rewrite:</span>
                        <p className="text-xs font-medium text-slate-100 mt-0.5">{b.after}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-[11px]">
                        <span className="text-slate-500 italic">💡 {b.reason}</span>
                        <button
                          onClick={() => copyBullet(b.after, idx)}
                          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedIndex === idx ? 'Copied' : 'Copy Rewrite'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
              <Award className="w-12 h-12 text-slate-700" />
              <h4 className="font-semibold text-base text-slate-300">Ready for ATS Audit</h4>
              <p className="text-xs max-w-sm">
                Paste your resume on the left and click <strong className="text-emerald-400">Run ATS Audit</strong> to calculate your score and get instant high-impact rewrites.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
