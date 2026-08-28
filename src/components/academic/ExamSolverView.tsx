import React, { useState } from 'react';
import { 
  GraduationCap, Sparkles, Copy, Check, Download, 
  FileText, Award, BookOpen, Layers, CheckCircle2, ChevronRight,
  BookMarked, HelpCircle
} from 'lucide-react';
import { marked } from 'marked';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';

export const ExamSolverView: React.FC = () => {
  const { profile, memories, settings, showToast } = useApp();
  
  const [subject, setSubject] = useState(profile.branch || 'Operating Systems');
  const [markType, setMarkType] = useState<'2-mark' | '5-mark' | '10-mark'>('10-mark');
  const [question, setQuestion] = useState('Explain Virtual Memory, Paging, and Page Fault Handling in Operating Systems with an architectural block diagram.');
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleQuestions = [
    'Explain Virtual Memory, Paging, and Page Fault Handling in OS with architectural diagram.',
    'Derive Bernoulli\'s Equation from Euler\'s equation of motion with assumptions.',
    'Explain Dijkstra\'s Shortest Path Algorithm with time complexity and a trace example.',
    'Compare TCP vs UDP protocols across 7 key architectural parameters in a neat table.',
    'Explain 8086 Microprocessor Architecture with internal block diagram.',
    'Explain Normalization in DBMS (1NF, 2NF, 3NF, BCNF) with anomaly examples.'
  ];

  const handleSolve = async (customQ?: string) => {
    const targetQ = customQ || question;
    if (!targetQ.trim() || isSolving) return;

    setIsSolving(true);
    showToast(`Generating university-standard ${markType} solution...`, 'info');

    try {
      const result = await aiService.solveExamQuestion(
        targetQ,
        subject,
        markType,
        { profile, memories, settings }
      );
      setSolution(result);
      showToast(`${markType} Solution generated successfully!`, 'success');
    } catch (err) {
      showToast('Failed to generate exam answer', 'error');
    } finally {
      setIsSolving(false);
    }
  };

  const copySolution = () => {
    if (!solution) return;
    navigator.clipboard.writeText(solution);
    setCopied(true);
    showToast('Answer copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    if (!solution) return;
    const blob = new Blob([solution], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-answer-${markType}.md`;
    a.click();
    showToast('Downloaded exam answer sheet!', 'success');
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/70 border border-indigo-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>University Examination & PYQ Architect</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">10-Mark University Exam Solver</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Generates rigorous academic solutions structured into 6 university scoring sections: Introduction, Definition, Detailed Explanation, Example / ASCII Diagram, Applications / Advantages, and Conclusion.
          </p>
        </div>

        {solution && (
          <div className="flex items-center gap-2">
            <button
              onClick={copySolution}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Answer'}</span>
            </button>
            <button
              onClick={downloadMarkdown}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download (.md)</span>
            </button>
          </div>
        )}
      </div>

      {/* Input Controls Panel */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Subject / Course Module</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Operating Systems, Computer Networks, DBMS, DSA..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Marks Format</label>
            <div className="grid grid-cols-3 gap-2">
              {(['2-mark', '5-mark', '10-mark'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMarkType(type)}
                  className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                    markType === type
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Exam Question</label>
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your university question or select a frequent PYQ below..."
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500 resize-none leading-relaxed"
          />
        </div>

        {/* Quick Sample Questions */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400">High-Frequency University PYQs:</span>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(q);
                  handleSolve(q);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 hover:border-indigo-500/40 text-left transition-all"
              >
                {q.slice(0, 45)}...
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => handleSolve()}
            disabled={isSolving || !question.trim()}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-semibold text-xs text-white shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSolving ? 'Solving 10-Mark Question...' : 'Generate 10-Mark Solution'}</span>
          </button>
        </div>
      </div>

      {/* Generated Solution Sheet */}
      {solution && (
        <div className="p-6 lg:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 uppercase">
                {markType} Verified Answer
              </span>
              <span className="text-xs text-slate-400">{subject}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Full Marks Format (6-Part Structure)</span>
            </div>
          </div>

          <div 
            className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: marked.parse(solution) as string }}
          />
        </div>
      )}

    </div>
  );
};
