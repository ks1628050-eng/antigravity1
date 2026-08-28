import React, { useState } from 'react';
import { 
  GraduationCap, Sparkles, BookOpen, CheckCircle2, 
  HelpCircle, Trophy, Clock, ArrowRight, Play, 
  Code2, RotateCcw, Award, Check, X, Plus, Trash2,
  Calendar, Layers, Target, CheckSquare
} from 'lucide-react';
import { marked } from 'marked';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { QuizQuestion, LearningRoadmap } from '../../types';

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
  const { roadmaps, addRoadmap, deleteRoadmap, toggleTopicCompletion, profile, memories, settings, showToast } = useApp();
  
  const [activeTab, setActiveTab] = useState<'roadmaps' | 'explainer' | 'quiz'>('roadmaps');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>(roadmaps[0]?.id || '');
  
  // Custom AI Roadmap Generation State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [topicInput, setTopicInput] = useState('');
  const [targetLevel, setTargetLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [estimatedWeeks, setEstimatedWeeks] = useState(6);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

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

  const selectedRoadmap = roadmaps.find(r => r.id === selectedRoadmapId) || roadmaps[0];
  const currentQuestions = sampleQuizzes.react;

  const handleCreateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() || isGeneratingRoadmap) return;

    setIsGeneratingRoadmap(true);
    showToast(`Generating custom curriculum for "${topicInput}"...`, 'info');

    try {
      const generated = await aiService.generateLearningRoadmap(
        topicInput,
        targetLevel,
        estimatedWeeks,
        { profile, memories, settings }
      );

      await addRoadmap(generated);
      setSelectedRoadmapId(generated.id);
      setIsGenerateModalOpen(false);
      setTopicInput('');
      showToast('New AI Learning Roadmap generated and saved!', 'success');
      confetti({ particleCount: 50, spread: 60 });
    } catch (err) {
      showToast('Failed to generate roadmap', 'error');
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

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

  const handleOptionSelect = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleQuizSubmit = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);

    if (selectedOption === currentQuestions[currentQuizIndex].correctAnswer) {
      setScore(prev => prev + 1);
      confetti({ particleCount: 40, spread: 50 });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex + 1 < currentQuestions.length) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
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
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-indigo-950/70 border border-emerald-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Curriculum & Mastery Engine</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">AI Learning Roadmaps</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Personalized engineering roadmaps tailored to your college semester and target roles. Generate custom curriculums with phases, topics, and practice projects.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-400/20 transition-all active:scale-95 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate AI Roadmap</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('roadmaps')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'roadmaps'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Roadmaps ({roadmaps.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('explainer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'explainer'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Concept Explainer</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'quiz'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Interactive Quiz</span>
        </button>
      </div>

      {/* Tab 1: Roadmaps View */}
      {activeTab === 'roadmaps' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Roadmap List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Curriculums</h3>
            {roadmaps.map(r => (
              <div
                key={r.id}
                onClick={() => setSelectedRoadmapId(r.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 relative ${
                  selectedRoadmap?.id === r.id
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {r.level} • {r.estimatedWeeks}w
                  </span>
                  <span className="text-xs font-bold text-indigo-300">{r.progress}%</span>
                </div>
                <h4 className="text-sm font-bold text-white">{r.title}</h4>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${r.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Right Roadmap Details & Interactive Modules */}
          {selectedRoadmap && (
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-indigo-400 font-semibold">{selectedRoadmap.level} Level Curriculum</span>
                    <h3 className="text-xl font-bold font-display text-white">{selectedRoadmap.title}</h3>
                    <p className="text-xs text-slate-400">{selectedRoadmap.description}</p>
                  </div>
                  <button
                    onClick={() => deleteRoadmap(selectedRoadmap.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Roadmap"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-400" /> {selectedRoadmap.estimatedWeeks} Weeks</span>
                  <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5 text-emerald-400" /> Progress: {selectedRoadmap.progress}%</span>
                </div>
              </div>

              {/* Modules List */}
              <div className="space-y-4">
                {selectedRoadmap.modules.map(mod => (
                  <div key={mod.id} className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <CheckSquare className={`w-4 h-4 ${mod.completed ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span>{mod.title}</span>
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        mod.completed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {mod.completed ? 'Completed' : 'In Progress'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {mod.topics.map((topic, tIdx) => (
                        <div
                          key={tIdx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs"
                        >
                          <span className="text-slate-300 font-medium">{topic}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleExplainTopic(topic)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Teach Me</span>
                            </button>
                            <button
                              onClick={() => toggleTopicCompletion(selectedRoadmap.id, mod.id, tIdx)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                mod.completed ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-emerald-400'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: AI Concept Explainer */}
      {activeTab === 'explainer' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Ask AI to Explain Any Concept</span>
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Virtual Memory and Paging, Banker's Algorithm, React 19 useActionState..."
                value={topicPrompt}
                onChange={(e) => setTopicPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExplainTopic()}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleExplainTopic()}
                disabled={isExplaining || !topicPrompt.trim()}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-semibold text-xs text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isExplaining ? 'Teaching...' : 'Explain'}</span>
              </button>
            </div>
          </div>

          {explanationResult && (
            <div className="p-6 lg:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 backdrop-blur-xl">
              <div 
                className="prose prose-invert prose-sm max-w-none text-slate-200"
                dangerouslySetInnerHTML={{ __html: marked.parse(explanationResult) as string }}
              />
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Interactive Quiz */}
      {activeTab === 'quiz' && (
        <div className="max-w-2xl mx-auto p-6 lg:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-2xl">
          {!quizFinished ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-indigo-400">
                  Question {currentQuizIndex + 1} of {currentQuestions.length}
                </span>
                <span className="text-xs font-bold text-emerald-400">Score: {score}</span>
              </div>

              <h3 className="text-base font-bold text-white">
                {currentQuestions[currentQuizIndex].question}
              </h3>

              <div className="space-y-2.5">
                {currentQuestions[currentQuizIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all ${
                      isAnswerSubmitted
                        ? idx === currentQuestions[currentQuizIndex].correctAnswer
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                          : selectedOption === idx
                          ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                        : selectedOption === idx
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {isAnswerSubmitted && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-indigo-400">Explanation:</span>
                  <p>{currentQuestions[currentQuizIndex].explanation}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={selectedOption === null}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white shadow-md shadow-indigo-600/20"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <Award className="w-12 h-12 mx-auto text-amber-400" />
              <h3 className="text-xl font-bold font-display text-white">Quiz Completed!</h3>
              <p className="text-sm text-slate-300">
                You scored <strong className="text-emerald-400">{score}</strong> out of <strong>{currentQuestions.length}</strong> ({Math.round((score / currentQuestions.length) * 100)}%).
              </p>
              <button
                onClick={resetQuiz}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20"
              >
                Take Quiz Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Custom AI Roadmap Generator Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-lg font-bold font-display text-white">Generate AI Roadmap</h3>
              </div>
              <button onClick={() => setIsGenerateModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoadmap} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Skill or Topic to Master</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Learn Python from beginner to advanced, Rust WebAssembly, Cloud DevOps"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Target Level</label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Duration (Weeks)</label>
                  <input
                    type="number"
                    min={2}
                    max={24}
                    value={estimatedWeeks}
                    onChange={(e) => setEstimatedWeeks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingRoadmap || !topicInput.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 shadow-md shadow-emerald-400/20 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGeneratingRoadmap ? 'Synthesizing Roadmap...' : 'Generate Roadmap'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
