import React, { useState } from 'react';
import { 
  CheckSquare, Plus, Trash2, Edit3, Calendar, Clock, 
  Sparkles, Filter, CheckCircle2, Circle, AlertCircle,
  Layers, ListTodo, ChevronRight, Wand2, X, Search, Check
} from 'lucide-react';
import { marked } from 'marked';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { TaskItem } from '../../types';

export const TasksView: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, profile, memories, settings, showToast } = useApp();
  
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskItem['priority']>('medium');
  const [category, setCategory] = useState<TaskItem['category']>('coding');
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [isSuggestingPriority, setIsSuggestingPriority] = useState(false);
  const [prioritySuggestionReason, setPrioritySuggestionReason] = useState<string | null>(null);

  // AI Task Breakdown modal state
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [breakdownGoal, setBreakdownGoal] = useState('');
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [generatedSubtasks, setGeneratedSubtasks] = useState<{ title: string; description: string; priority: 'high' | 'medium' | 'low'; deadline: string; selected: boolean }[]>([]);

  // Daily plan state
  const [isPlanningDay, setIsPlanningDay] = useState(false);
  const [dailyPlan, setDailyPlan] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('coding');
    setDeadline(new Date().toISOString().split('T')[0]);
    setPrioritySuggestionReason(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setCategory(task.category || 'coding');
    setDeadline(task.deadline);
    setPrioritySuggestionReason(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      await updateTask({
        ...editingTask,
        title,
        description,
        priority,
        category,
        deadline
      });
    } else {
      await addTask({
        title,
        description,
        priority,
        category,
        deadline,
        isCompleted: false
      });
    }
    setIsModalOpen(false);
  };

  const handleSuggestPriority = async () => {
    if (!title.trim()) {
      showToast('Enter a task title first to get AI priority recommendation', 'info');
      return;
    }
    setIsSuggestingPriority(true);
    try {
      const res = await aiService.suggestPriority(title, description, deadline, { profile, memories, settings });
      setPriority(res.priority);
      setPrioritySuggestionReason(res.reason);
      showToast(`AI suggested ${res.priority.toUpperCase()} priority!`, 'success');
    } catch (err) {
      showToast('Priority analysis fallback applied', 'info');
    } finally {
      setIsSuggestingPriority(false);
    }
  };

  const handleOpenBreakdown = () => {
    setBreakdownGoal('');
    setGeneratedSubtasks([]);
    setIsBreakdownModalOpen(true);
  };

  const handleGenerateBreakdown = async () => {
    if (!breakdownGoal.trim() || isDecomposing) return;
    setIsDecomposing(true);
    showToast('AI is decomposing your project goal into actionable tasks...', 'info');
    try {
      const subtasks = await aiService.breakdownTask(breakdownGoal, { profile, memories, settings });
      setGeneratedSubtasks(subtasks.map(s => ({ ...s, selected: true })));
      showToast('AI generated subtasks! Select the ones you want to save.', 'success');
    } catch (err) {
      showToast('Failed to decompose goal', 'error');
    } finally {
      setIsDecomposing(false);
    }
  };

  const handleSaveSelectedSubtasks = async () => {
    const selected = generatedSubtasks.filter(s => s.selected);
    if (selected.length === 0) {
      showToast('Select at least one task to save', 'info');
      return;
    }

    for (const item of selected) {
      await addTask({
        title: item.title,
        description: item.description,
        priority: item.priority,
        category: 'project',
        deadline: item.deadline,
        isCompleted: false
      });
    }
    setIsBreakdownModalOpen(false);
    showToast(`Added ${selected.length} tasks to your board!`, 'success');
  };

  const toggleSubtaskSelection = (index: number) => {
    setGeneratedSubtasks(prev => prev.map((s, idx) => idx === index ? { ...s, selected: !s.selected } : s));
  };

  const handlePlanMyDay = async () => {
    setIsPlanningDay(true);
    showToast('AI is synthesizing your optimal daily schedule...', 'info');
    try {
      const plan = await aiService.generateDailySchedule(tasks, { profile, memories, settings });
      setDailyPlan(plan);
      showToast('Daily schedule generated!', 'success');
    } catch (err: any) {
      showToast('Failed to generate daily plan', 'error');
    } finally {
      setIsPlanningDay(false);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterStatus === 'active' && t.isCompleted) return false;
    if (filterStatus === 'completed' && !t.isCompleted) return false;
    if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Banner with AI Actions */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900/90 to-indigo-950/60 border border-amber-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>AI Task Planner & Agile Board</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">Engineering Task Board</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Track sprints, semester assignments, LeetCode targets, and project milestones. Use AI to break down complex goals into actionable subtasks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenBreakdown}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Task Breakdown</span>
          </button>

          <button
            onClick={handlePlanMyDay}
            disabled={isPlanningDay}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-purple-200 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Clock className="w-4 h-4 text-purple-400" />
            <span>{isPlanningDay ? 'Synthesizing...' : 'Plan My Day'}</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Daily Plan Output */}
      {dailyPlan && (
        <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900/80 border border-purple-500/30 backdrop-blur-xl relative">
          <button 
            onClick={() => setDailyPlan(null)}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold mb-3">
            <Sparkles className="w-4 h-4" />
            <span>AI Synthesized Day Block Schedule</span>
          </div>
          <div 
            className="prose prose-invert prose-sm max-w-none text-slate-200"
            dangerouslySetInnerHTML={{ __html: marked.parse(dailyPlan) as string }}
          />
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500"
            >
              <option value="all">All ({tasks.length})</option>
              <option value="active">Active ({pendingCount})</option>
              <option value="completed">Completed ({completedCount})</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 text-slate-400 space-y-3">
            <CheckSquare className="w-10 h-10 mx-auto text-slate-600" />
            <p className="font-semibold text-sm">No tasks matching your current filter</p>
            <p className="text-xs text-slate-500">Create a task or click "AI Task Breakdown" to automatically decompose a project goal.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`p-4 lg:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                task.isCompleted 
                  ? 'bg-slate-900/30 border-slate-800/40 opacity-75' 
                  : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`mt-0.5 p-1 rounded-lg transition-colors ${
                  task.isCompleted 
                    ? 'text-emerald-400 bg-emerald-500/10' 
                    : 'text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10'
                }`}
              >
                {task.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </button>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className={`text-sm font-semibold ${task.isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                    {task.title}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                    task.priority === 'high' 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                      : task.priority === 'medium'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-700/40 text-slate-300 border border-slate-700'
                  }`}>
                    {task.priority}
                  </span>
                  {task.category && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
                      {task.category}
                    </span>
                  )}
                </div>

                {task.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  {task.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Due: {task.deadline}</span>
                    </span>
                  )}
                  <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-center">
                <button
                  onClick={() => openEditModal(task)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Edit task"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold font-display text-white">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Task Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Implement Dijkstra Algorithm in C++"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  placeholder="Optional details, acceptance criteria, or notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Priority</label>
                    <button
                      type="button"
                      onClick={handleSuggestPriority}
                      disabled={isSuggestingPriority}
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isSuggestingPriority ? 'Analyzing...' : 'AI Suggest'}</span>
                    </button>
                  </div>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {prioritySuggestionReason && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 space-y-0.5">
                  <div className="font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Recommendation
                  </div>
                  <p>{prioritySuggestionReason}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
                >
                  {editingTask ? 'Update Task' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Task Breakdown Modal */}
      {isBreakdownModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-lg font-bold font-display text-white">AI Task Breakdown</h3>
              </div>
              <button onClick={() => setIsBreakdownModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Enter a major project goal or assignment:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Build an AI-Powered Real-Time Chat App with WebSockets and Supabase"
                  value={breakdownGoal}
                  onChange={(e) => setBreakdownGoal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateBreakdown()}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleGenerateBreakdown}
                  disabled={isDecomposing || !breakdownGoal.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isDecomposing ? 'Decomposing...' : 'Decompose'}</span>
                </button>
              </div>
            </div>

            {/* Generated Subtasks Preview List */}
            {generatedSubtasks.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Review AI-generated tasks before saving to your board:</span>
                  <span className="font-semibold text-amber-300">
                    {generatedSubtasks.filter(s => s.selected).length} of {generatedSubtasks.length} selected
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {generatedSubtasks.map((sub, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleSubtaskSelection(idx)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        sub.selected
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-slate-950/60 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className={`mt-0.5 p-1 rounded-md ${sub.selected ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-white">{sub.title}</h5>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase ${
                            sub.priority === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700/40 text-slate-300'
                          }`}>
                            {sub.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{sub.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsBreakdownModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSelectedSubtasks}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
                  >
                    Save Selected to Task Board
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
