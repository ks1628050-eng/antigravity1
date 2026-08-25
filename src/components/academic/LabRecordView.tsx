import React, { useState } from 'react';
import { 
  FileCode, Sparkles, Copy, Check, Download, 
  Printer, Layers, CheckCircle2, Bookmark, Terminal
} from 'lucide-react';
import { marked } from 'marked';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';

export const LabRecordView: React.FC = () => {
  const { profile, memories, settings, showToast } = useApp();
  
  const [labSubject, setLabSubject] = useState('Data Structures & Algorithms Laboratory');
  const [experimentTitle, setExperimentTitle] = useState("Implement Dijkstra's Algorithm for Single-Source Shortest Path in C++");
  const [progLang, setProgLang] = useState('C++');
  const [isGenerating, setIsGenerating] = useState(false);
  const [labRecord, setLabRecord] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleExperiments = [
    "Implement Dijkstra's Algorithm for Single-Source Shortest Path in C++",
    "Banker's Algorithm for Deadlock Avoidance in C",
    "Design and Implementation of LRU Page Replacement in Python",
    "Design an ER Diagram and implement 3NF Normalized Schema for Hospital Management in SQL",
    "Implement a 4-bit Binary Full Adder using Verilog HDL"
  ];

  const handleGenerate = async (customExp?: string) => {
    const target = customExp || experimentTitle;
    if (!target.trim() || isGenerating) return;

    setIsGenerating(true);
    showToast('Synthesizing standard University Practical Lab Record...', 'info');

    const prompt = `Generate a complete university-standard laboratory practical record writeup for:
Experiment Title: "${target}"
Subject: ${labSubject}
Programming Language: ${progLang}

Format strictly with standard college headings:
1. **EXPERIMENT TITLE**
2. **AIM OF THE EXPERIMENT**
3. **HARDWARE & SOFTWARE REQUIREMENTS**
4. **THEORY & PRINCIPLE OF OPERATION**
5. **ALGORITHM / FLOWCHART (Step-by-step numbered)**
6. **COMPLETE SOURCE CODE (Clean, commented ${progLang})**
7. **SAMPLE INPUT & OUTPUT TEST CASES**
8. **TOP 5 VIVA VOCE QUESTIONS WITH MODEL ANSWERS**
9. **PRECAUTIONS & RESULT / CONCLUSION**`;

    try {
      const result = await aiService.generateChatResponse(
        prompt,
        [],
        { profile, memories, settings }
      );
      setLabRecord(result);
      showToast('Lab Record generated successfully!', 'success');
    } catch (err) {
      showToast('Failed to generate lab record', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyRecord = () => {
    if (!labRecord) return;
    navigator.clipboard.writeText(labRecord);
    setCopied(true);
    showToast('Lab record copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const printRecord = () => {
    window.print();
  };

  const downloadMarkdown = () => {
    if (!labRecord) return;
    const blob = new Blob([labRecord], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-record-${experimentTitle.slice(0, 20).replace(/\s+/g, '-')}.md`;
    a.click();
    showToast('Downloaded Lab Record file!', 'success');
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/70 via-slate-900/90 to-indigo-950/70 border border-blue-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            <FileCode className="w-3.5 h-3.5" />
            <span>University Practical & Lab Manual Generator</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">Lab Record Generator</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Auto-generate complete university practical records (Aim, Theory, Code, Sample I/O, and Top 5 Viva Questions with answers) with 1-click print & PDF formatting.
          </p>
        </div>

        <button
          onClick={() => handleGenerate()}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? 'Generating...' : 'Generate Record'}</span>
        </button>
      </div>

      {/* Inputs */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Laboratory Subject</label>
            <input
              type="text"
              value={labSubject}
              onChange={(e) => setLabSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Language / Tool</label>
            <select
              value={progLang}
              onChange={(e) => setProgLang(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-blue-500"
            >
              <option value="C++">C++ 20</option>
              <option value="C">C Language</option>
              <option value="Python">Python 3.12</option>
              <option value="Java">Java 21</option>
              <option value="SQL">PostgreSQL / MySQL</option>
              <option value="Verilog HDL">Verilog HDL</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Experiment Aim & Title *</label>
          <input
            type="text"
            value={experimentTitle}
            onChange={(e) => setExperimentTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-blue-500"
          />
        </div>

        {/* Template Pills */}
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quick Experiment Templates:</p>
          <div className="flex flex-wrap gap-2">
            {sampleExperiments.map((exp, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setExperimentTitle(exp);
                  handleGenerate(exp);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-colors text-left"
              >
                {exp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Record Sheet */}
      {labRecord && (
        <div className="p-6 lg:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6 animate-scaleUp">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 uppercase">
              University Record Format
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={copyRecord}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={printRecord}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Record</span>
              </button>

              <button
                onClick={downloadMarkdown}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors shadow-md shadow-indigo-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .MD</span>
              </button>
            </div>
          </div>

          <div 
            className="markdown-content text-sm text-slate-200 leading-relaxed bg-slate-950 p-6 rounded-2xl border border-slate-800/80"
            dangerouslySetInnerHTML={{ __html: (marked.parse(labRecord || '', { async: false }) as string) || labRecord }}
          />
        </div>
      )}

    </div>
  );
};
