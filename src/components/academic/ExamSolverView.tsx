import React, { useState } from 'react';
import { 
  GraduationCap, Sparkles, Copy, Check, Download, 
  FileText, Award, BookOpen, Layers, CheckCircle2, ChevronRight
} from 'lucide-react';
import { marked } from 'marked';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';

export const ExamSolverView: React.FC = () => {
  const { profile, memories, settings, showToast } = useApp();
  
  const [branch, setBranch] = useState(profile.branch || 'CSE (Artificial Intelligence & Data Science)');
  const [semester, setSemester] = useState(profile.currentSemester || '6th Semester');
  const [markType, setMarkType] = useState<'2-mark' | '5-mark' | '10-mark'>('10-mark');
  const [question, setQuestion] = useState('Explain Virtual Memory, Paging, and Page Fault Handling in Operating Systems with a neat architectural block diagram.');
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleQuestions = [
    'Explain Virtual Memory, Paging, and Page Fault Handling in OS with architectural diagram.',
    'Derive Bernoulli\'s Equation from Euler\'s equation of motion with assumptions.',
    'Explain Dijkstra\'s Shortest Path Algorithm with time complexity and a trace example.',
    'Compare TCP vs UDP protocols across 7 key architectural parameters in a neat table.',
    'Explain 8086 Microprocessor Architecture with internal block diagram.'
  ];

  const handleSolve = async (customQ?: string) => {
    const targetQ = customQ || question;
    if (!targetQ.trim() || isSolving) return;

    setIsSolving(true);
    showToast(`Generating university-standard ${markType} solution...`, 'info');

    const prompt = `Solve this engineering semester university exam question formatted strictly for a ${markType.toUpperCase()} university answer sheet.
Question: "${targetQ}"
Branch: ${branch}
Semester: ${semester}

Format Requirements:
1. Heading: Clear Exam Question Title & High-Weightage Badge
2. Structure:
   - Concise Technical Definition / Principle (1-2 sentences)
   - Detailed Theoretical Derivation / Mechanism
   - ASCII Block Diagram / Circuit / Flow Architecture
   - Detailed Step-by-Step Mathematical Equations or Algorithm
   - Key University Exam Highlights / 5-Star Memorization Points for 100% full marks.`;

    try {
      const result = await aiService.generateChatResponse(
        prompt,
        [],
        { profile, memories, settings }
      );
      setSolution(result);
      showToast('10-Mark Solution generated successfully!', 'success');
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

  const downloadPDF = () => {
    if (!solution) return;
    const blob = new Blob([solution], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-answer-${markType}.md`;
    a.click();
    showToast('Downloaded exam sheet!', 'success');
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
            Tuned for VTU, JNTU, SPPU, Anna Univ, and Autonomous college formats. Generates structured answers with ASCII diagrams, math derivations, and full-mark scoring keys.
          </p>
        </div>

        <button
          onClick={() => handleSolve()}
          disabled={isSolving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSolving ? 'Solving...' : 'Generate 10-Mark Answer'}</span>
        </button>
      </div>

      {/* Configuration & Question Input */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Branch</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500"
            >
              <option value="CSE / IT">Computer Science & IT</option>
              <option value="AI / DS">AI & Data Science</option>
              <option value="ECE">Electronics & Communication (ECE)</option>
              <option value="EEE">Electrical & Electronics (EEE)</option>
              <option value="Mechanical">Mechanical Engineering</option>
              <option value="Civil">Civil Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500"
            >
              <option value="1st Semester">1st Semester (1st Year)</option>
              <option value="2nd Semester">2nd Semester (1st Year)</option>
              <option value="3rd Semester">3rd Semester (2nd Year)</option>
              <option value="4th Semester">4th Semester (2nd Year)</option>
              <option value="5th Semester">5th Semester (3rd Year)</option>
              <option value="6th Semester">6th Semester (3rd Year)</option>
              <option value="7th Semester">7th Semester (4th Year)</option>
              <option value="8th Semester">8th Semester (4th Year)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Exam Weightage Format</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['2-mark', '5-mark', '10-mark'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMarkType(m)}
                  className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                    markType === m 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">University Exam Question *</label>
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type or paste any university question from your syllabus..."
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-100 placeholder-slate-500 outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Sample Question Pills */}
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Frequently Asked Previous Year Questions (PYQs):</p>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(q);
                  handleSolve(q);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Exam Solution Output */}
      {solution && (
        <div className="p-6 lg:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6 animate-scaleUp">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 uppercase">
                {markType} Model Answer
              </span>
              <span className="text-xs text-slate-400">• {branch}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copySolution}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={downloadPDF}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors shadow-md shadow-indigo-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Answer</span>
              </button>
            </div>
          </div>

          <div 
            className="markdown-content text-sm text-slate-200 leading-relaxed bg-slate-950 p-6 rounded-2xl border border-slate-800/80"
            dangerouslySetInnerHTML={{ __html: (marked.parse(solution || '', { async: false }) as string) || solution }}
          />
        </div>
      )}

    </div>
  );
};
