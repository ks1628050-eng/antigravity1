import React, { useState, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, Sparkles, Award, 
  RotateCcw, ArrowRight, Play, CheckCircle2, User, 
  Bot, AlertCircle, ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { speechService } from '../../services/speechService';
import { aiService } from '../../services/aiService';

interface VivaQuestion {
  id: number;
  question: string;
  expectedKeywords: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const vivaQuestionBanks: Record<string, VivaQuestion[]> = {
  'Data Structures & Algorithms': [
    {
      id: 1,
      question: 'What is the time complexity of building a Binary Heap from an unordered array of N elements, and why is it not O(N log N)?',
      expectedKeywords: ['O(N)', 'linear time', 'sum of heights', 'sift down', 'leaf nodes'],
      difficulty: 'Medium'
    },
    {
      id: 2,
      question: 'Explain how an LRU Cache achieves O(1) time complexity for both get and put operations.',
      expectedKeywords: ['hash map', 'doubly linked list', 'head and tail', 'O(1)', 'constant time'],
      difficulty: 'Medium'
    },
    {
      id: 3,
      question: 'What happens if you use QuickSort on an already sorted array with the last element chosen as pivot?',
      expectedKeywords: ['worst case', 'O(N^2)', 'unbalanced partition', 'skewed tree'],
      difficulty: 'Hard'
    }
  ],
  'Operating Systems': [
    {
      id: 1,
      question: 'What are the 4 necessary and sufficient conditions for a Deadlock to occur in an operating system?',
      expectedKeywords: ['mutual exclusion', 'hold and wait', 'no preemption', 'circular wait'],
      difficulty: 'Easy'
    },
    {
      id: 2,
      question: 'What is the difference between Internal and External Fragmentation, and how does Paging prevent external fragmentation?',
      expectedKeywords: ['fixed size pages', 'frame allocation', 'internal within page', 'non-contiguous memory'],
      difficulty: 'Medium'
    }
  ],
  'Database Management Systems (DBMS)': [
    {
      id: 1,
      question: 'Explain the ACID properties of database transactions with real-world examples.',
      expectedKeywords: ['atomicity', 'consistency', 'isolation', 'durability', 'commit', 'rollback'],
      difficulty: 'Easy'
    },
    {
      id: 2,
      question: 'Why do databases prefer B+ Trees over standard Binary Search Trees for indexing on disk storage?',
      expectedKeywords: ['disk I/O', 'fan out', 'block size', 'sequential leaf scan', 'shallow depth'],
      difficulty: 'Hard'
    }
  ]
};

export const VivaSimulatorView: React.FC = () => {
  const { profile, memories, settings, showToast } = useApp();
  
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [qIndex, setQIndex] = useState(0);
  const [spokenAnswer, setSpokenAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<{ score: number; critique: string; followUp: string } | null>(null);

  const speechRecognizerRef = useRef<any>(null);

  const currentBank = vivaQuestionBanks[subject] || vivaQuestionBanks['Data Structures & Algorithms'];
  const currentQ = currentBank[qIndex] || currentBank[0];

  const handleReadQuestion = () => {
    speechService.speak(currentQ.question);
    showToast('Reading viva question...', 'info');
  };

  const toggleMic = () => {
    if (isListening) {
      speechRecognizerRef.current?.stop();
      setIsListening(false);
    } else {
      const recognizer = speechService.createSpeechRecognizer(
        (transcript) => setSpokenAnswer(transcript),
        (error) => {
          showToast(error, 'error');
          setIsListening(false);
        },
        () => setIsListening(false)
      );

      if (recognizer) {
        speechRecognizerRef.current = recognizer;
        recognizer.start();
        setIsListening(true);
        showToast('Listening... Speak your answer clearly', 'info');
      }
    }
  };

  const handleEvaluate = async () => {
    if (!spokenAnswer.trim() || isEvaluating) return;

    setIsEvaluating(true);
    showToast('Examiner is evaluating your answer...', 'info');

    const prompt = `Act as a strict, knowledgeable Engineering University Viva Examiner.
Question Asked: "${currentQ.question}"
Subject: ${subject}
Student's Spoken Answer: "${spokenAnswer}"

Provide:
1. Score out of 10
2. Constructive Critique (what was strong, what crucial technical keywords were missed)
3. 1 Tricky follow-up edge-case question.`;

    try {
      const result = await aiService.generateChatResponse(
        prompt,
        [],
        { profile, memories, settings }
      );

      // Extract realistic score from LLM response or calculate from keyword match
      let score = 7;
      const scoreMatch = result.match(/score:?\s*(\d+)/i) || result.match(/(\d+)\s*\/\s*10/i);
      if (scoreMatch && scoreMatch[1]) {
        score = parseInt(scoreMatch[1], 10);
      } else {
        const lower = spokenAnswer.toLowerCase();
        const matched = currentQ.expectedKeywords.filter(k => lower.includes(k.toLowerCase()));
        score = Math.max(4, Math.min(10, Math.round(4 + (matched.length / Math.max(1, currentQ.expectedKeywords.length)) * 6)));
      }
      score = Math.min(10, Math.max(1, score));

      // Extract follow-up question
      const followUpMatch = result.match(/follow[- ]?up.*?:?\s*([^\n]+)/i);
      const followUp = followUpMatch ? followUpMatch[1].trim() : 'Can you explain the real-world trade-off in high concurrency environments?';

      setFeedback({
        score,
        critique: result,
        followUp
      });

      if (score >= 8) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }

      showToast(`Viva score: ${score}/10!`, 'success');
    } catch (err) {
      showToast('Evaluation failed', 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    if (qIndex + 1 < currentBank.length) {
      setQIndex(prev => prev + 1);
      setSpokenAnswer('');
      setFeedback(null);
    } else {
      setQIndex(0);
      setSpokenAnswer('');
      setFeedback(null);
      showToast('Viva session completed! Resetting bank.', 'success');
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-indigo-950/70 border border-purple-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Oral Viva Voce & Laboratory Exam Simulator</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">Live Voice Viva Examiner</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Experience realistic university external examiner grilling. Listen to oral questions, answer using your mic, and receive immediate scoring and edge-case feedback.
          </p>
        </div>

        <select
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setQIndex(0);
            setSpokenAnswer('');
            setFeedback(null);
          }}
          className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white outline-none focus:border-purple-500"
        >
          <option value="Data Structures & Algorithms">DSA Lab Viva</option>
          <option value="Operating Systems">OS Lab Viva</option>
          <option value="Database Management Systems (DBMS)">DBMS Lab Viva</option>
        </select>
      </div>

      {/* Main Question & Speech Interface */}
      <div className="p-6 lg:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
        
        {/* Examiner Question Box */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-purple-500/30 shadow-inner space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xs font-bold">
                Q{qIndex + 1}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Examiner's Oral Question ({currentQ.difficulty})
              </span>
            </div>

            <button
              onClick={handleReadQuestion}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>Read Aloud</span>
            </button>
          </div>

          <h3 className="text-lg lg:text-xl font-display font-semibold text-white leading-snug">
            "{currentQ.question}"
          </h3>
        </div>

        {/* Student Voice / Text Answer Box */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>Your Answer (Speak or Type)</span>
            </label>
            
            <button
              onClick={toggleMic}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isListening 
                  ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 animate-pulse' 
                  : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
              <span>{isListening ? 'Listening (Click to Stop)...' : 'Record Voice Answer'}</span>
            </button>
          </div>

          <textarea
            rows={4}
            value={spokenAnswer}
            onChange={(e) => setSpokenAnswer(e.target.value)}
            placeholder="Click 'Record Voice Answer' or type your oral explanation here..."
            className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500 resize-none leading-relaxed"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleEvaluate}
              disabled={!spokenAnswer.trim() || isEvaluating}
              className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-md shadow-indigo-600/20"
            >
              {isEvaluating ? 'Evaluating...' : 'Submit to Examiner'}
            </button>
          </div>
        </div>

        {/* Examiner Evaluation Card */}
        {feedback && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-850 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Oral Viva Score</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-display font-extrabold text-emerald-400">{feedback.score}</span>
                  <span className="text-sm text-slate-400">/ 10</span>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-colors shadow-md shadow-purple-600/20"
              >
                <span>Next Viva Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p className="font-semibold text-purple-300">👨‍🏫 Examiner's Technical Critique:</p>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                {feedback.critique}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
