import React, { useState } from 'react';
import { 
  GraduationCap, Sparkles, BookOpen, CheckCircle2, 
  HelpCircle, Trophy, Clock, ArrowRight, Play, 
  Code2, RotateCcw, Award, Check, X
} from 'lucide-react';
import { marked } from 'marked';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { QuizQuestion } from '../../types';

const sampleQuizzes: Record<string, QuizQuestion[]> = {
  react: [
    {
      id: 'q1',
      question: 'Which new React 19 hook allows you to update state optimistically while an async action is in flight?',
      options: ['useOptimistic', 'useDeferredValue', 'useTransition', 'useActionState'],
      correctAnswer: 0,
      explanation: 'useOptimistic allows you to show an optimistic state to the user immediately while an async action (like a server mutation) completes.',
      category: 'React 19'
    },
    {
      id: 'q2',
      question: 'What is the time complexity of searching an element in a balanced Binary Search Tree (AVL / Red-Black)?',
      options: ['O(1)', 'O(N)', 'O(log N)', 'O(N log N)'],
      correctAnswer: 2,
      explanation: 'In a self-balancing BST of height h = log2(N), search takes O(log N) comparisons.',
      category: 'DSA'
    },
    {
      id: 'q3',
      question: 'In Python, what is the primary difference between a list and a tuple?',
      options: ['Tuples are mutable, lists are immutable', 'Lists are mutable, tuples are immutable', 'Lists cannot store heterogeneous types', 'Tuples use more memory than lists'],
      correctAnswer: 1,
      explanation: 'Lists are mutable sequences that can be modified in place, whereas tuples are immutable fixed-size sequences.',
      category: 'Python'
    },
    {
      id: 'q4',
      question: 'Which algorithm is used by Operating Systems for Deadlock Avoidance by checking safe states?',
      options: ["Dijkstra's Algorithm", "Banker's Algorithm", "Round Robin Algorithm", "Kruskal's Algorithm"],
      correctAnswer: 1,
      explanation: "Banker's Algorithm tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources.",
      category: 'Operating Systems'
    }
  ]
};

export const LearningView: React.FC = () => {
  const { roadmaps, profile, memories, settings, showToast } = useApp();
  
  const [activeTab, setActiveTab] = useState<'roadmaps' | 'explainer' | 'quiz'>('roadmaps');
  const [selectedRoadmap, setSelectedRoadmap] = useState(roadmaps[0]);
  
  // Topic Explainer state
  const [topicPrompt, setTopicPrompt] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationResult, setExplanationResult] = useState<string | null>(null);

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestions = sampleQuizzes.react;

  const handleExplainTopic = async (topic?: string) => {
    const query = topic || topicPrompt;
    if (!query.trim() || isExplaining) return;

    setIsExplaining(true);
    showToast(`Generating deep-dive masterclass for: "${query}"...`, 'info');

    try {
      const prompt = `Teach me "${query}" from beginner to advanced. 
Format with:
1. Intuitive Real-world Analogy
2. Core Conceptual Breakdown
3. Line-by-Line Code Example (TypeScript / Python)
4. Big-O Time/Space Complexity
5. 3 Common Interview / Exam Viva Questions with Model Answers.`;

      const response = await aiService.generateChatResponse(
        prompt,
        [],
        { profile, memories, settings }
      );

      setExplanationResult(response);
      setActiveTab('explainer');
      showToast('Masterclass generated!', 'success');
    } catch (err) {
      showToast('Failed to generate explanation', 'error');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQuestions[currentQuizIndex].correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex + 1 < currentQuestions.length) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const resetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/70 border border-indigo-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic & Skill Mastery</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">Learning Hub & Quizzes</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Master engineering topics, explore comprehensive branch roadmaps, and test your knowledge with timed quizzes.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('roadmaps')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'roadmaps' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Roadmaps
          </button>
          <button
            onClick={() => setActiveTab('explainer')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'explainer' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Topic Explainer
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'quiz' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quiz Arena
          </button>
        </div>
      </div>

      {/* 1. ROADMAPS TAB */}
      {activeTab === 'roadmaps' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Roadmap Selector */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Curated Roadmaps:</h3>
            {roadmaps.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRoadmap(r)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                  selectedRoadmap.id === r.id
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-950/50'
                    : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    {r.level}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-400">{r.estimatedWeeks} Weeks</span>
                </div>
                <h4 className="font-semibold text-white text-base">{r.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{r.description}</p>
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{r.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${r.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Roadmap Details */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-display font-bold text-xl text-white">{selectedRoadmap.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedRoadmap.description}</p>
              </div>
              <button
                onClick={() => handleExplainTopic(selectedRoadmap.title)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explain Full Roadmap</span>
              </button>
            </div>

            <div className="space-y-4">
              {selectedRoadmap.modules.map((mod, idx) => (
                <div key={mod.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span>{mod.title}</span>
                    </h4>
                    {mod.completed && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        COMPLETED
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {mod.topics.map((t, tIdx) => (
                      <div
                        key={tIdx}
                        onClick={() => handleExplainTopic(`${t} in ${selectedRoadmap.title}`)}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800/80 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <span className="truncate">{t}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. TOPIC EXPLAINER TAB */}
      {activeTab === 'explainer' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
            <h3 className="font-display font-semibold text-lg text-white">AI Concept Explainer & Masterclass</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={topicPrompt}
                onChange={(e) => setTopicPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExplainTopic()}
                placeholder="e.g. Teach me React 19 Actions from scratch, or Virtual Memory Paging..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-sm text-slate-100 placeholder-slate-500 outline-none"
              />
              <button
                onClick={() => handleExplainTopic()}
                disabled={!topicPrompt.trim() || isExplaining}
                className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isExplaining ? 'Synthesizing...' : 'Explain'}</span>
              </button>
            </div>
          </div>

          {explanationResult && (
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl">
              <div 
                className="markdown-content text-sm text-slate-200 leading-relaxed bg-slate-950 p-6 rounded-xl border border-slate-800/80"
                dangerouslySetInnerHTML={{ __html: (marked.parse(explanationResult || '', { async: false }) as string) || explanationResult }}
              />
            </div>
          )}
        </div>
      )}

      {/* 3. QUIZ ARENA TAB */}
      {activeTab === 'quiz' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl max-w-3xl mx-auto space-y-6">
          {!quizFinished ? (
            <div className="space-y-6">
              {/* Quiz Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {currentQuestions[currentQuizIndex].category}
                  </span>
                  <h3 className="font-display font-semibold text-base text-white mt-1.5">
                    Question {currentQuizIndex + 1} of {currentQuestions.length}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-400">Current Score</p>
                  <p className="text-lg font-bold font-mono text-emerald-400">{score} / {currentQuestions.length}</p>
                </div>
              </div>

              {/* Question Text */}
              <h4 className="text-lg font-semibold text-slate-100 leading-snug">
                {currentQuestions[currentQuizIndex].question}
              </h4>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestions[currentQuizIndex].options.map((opt, idx) => {
                  let optStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';
                  if (selectedOption === idx) {
                    optStyle = 'bg-indigo-950/60 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-950/40';
                  }
                  if (isAnswerSubmitted) {
                    if (idx === currentQuestions[currentQuizIndex].correctAnswer) {
                      optStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/40';
                    } else if (selectedOption === idx) {
                      optStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${optStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-mono font-bold">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isAnswerSubmitted && idx === currentQuestions[currentQuizIndex].correctAnswer && (
                        <Check className="w-5 h-5 text-emerald-400" />
                      )}
                      {isAnswerSubmitted && selectedOption === idx && idx !== currentQuestions[currentQuizIndex].correctAnswer && (
                        <X className="w-5 h-5 text-rose-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation (if answered) */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-indigo-400">💡 AI Explanation:</p>
                  <p>{currentQuestions[currentQuizIndex].explanation}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center gap-2"
                  >
                    <span>{currentQuizIndex + 1 === currentQuestions.length ? 'View Score' : 'Next Question'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <Trophy className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-bold text-white">Quiz Completed!</h3>
                <p className="text-slate-300 text-sm">
                  You scored <strong className="text-emerald-400 font-mono text-lg">{score} / {currentQuestions.length}</strong> (
                  {Math.round((score / currentQuestions.length) * 100)}%)
                </p>
              </div>

              <button
                onClick={resetQuiz}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-colors inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
