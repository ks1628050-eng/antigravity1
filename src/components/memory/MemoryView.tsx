import React, { useState } from 'react';
import { 
  Brain, Plus, Trash2, Edit3, Sparkles, CheckCircle2, 
  ShieldCheck, Filter, Search, Tag, X, Star, AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MemoryItem, MemoryCategory } from '../../types';

export const MemoryView: React.FC = () => {
  const { memories, addMemory, updateMemory, deleteMemory, showToast } = useApp();
  
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('Skills');
  const [importance, setImportance] = useState<'high' | 'medium' | 'low'>('medium');

  const categories: MemoryCategory[] = [
    'Profile',
    'Education',
    'Skills',
    'Projects',
    'Goals',
    'Preferences',
    'Other'
  ];

  const openCreateModal = () => {
    setEditingMemory(null);
    setContent('');
    setCategory('Skills');
    setImportance('medium');
    setIsModalOpen(true);
  };

  const openEditModal = (mem: MemoryItem) => {
    setEditingMemory(mem);
    setContent(mem.content);
    setCategory(mem.category);
    setImportance(mem.importance || 'medium');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (editingMemory) {
      await updateMemory({
        ...editingMemory,
        content,
        category,
        importance
      });
    } else {
      await addMemory({
        content,
        category,
        importance
      });
    }
    setIsModalOpen(false);
  };

  const filteredMemories = memories.filter(m => {
    if (filterCategory !== 'all' && m.category.toLowerCase() !== filterCategory.toLowerCase()) return false;
    if (searchQuery.trim() && !m.content.toLowerCase().includes(searchQuery.toLowerCase()) && !m.category.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/70 via-slate-900/90 to-purple-950/70 border border-blue-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            <Brain className="w-3.5 h-3.5" />
            <span>Persistent Context & Memory Graph</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">AI Memory Vault</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Facts and preferences stored here are automatically injected into your AI assistant's system context, delivering personalized responses tailored to your skills, goals, and coding preferences.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Memory</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>{memories.length} Active Memories</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="Profile">Profile</option>
              <option value="Education">Education</option>
              <option value="Skills">Skills</option>
              <option value="Projects">Projects</option>
              <option value="Goals">Goals</option>
              <option value="Preferences">Preferences</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Memory Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.length === 0 ? (
          <div className="col-span-2 p-12 text-center rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 text-slate-400 space-y-2">
            <Brain className="w-10 h-10 mx-auto text-slate-600" />
            <p className="font-semibold text-sm">No memories found</p>
            <p className="text-xs text-slate-500">Add a memory about your skills, projects, or goals to personalize your AI responses.</p>
          </div>
        ) : (
          filteredMemories.map(mem => (
            <div
              key={mem.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                    {mem.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className={`px-2 py-0.2 rounded text-[9px] font-semibold uppercase ${
                      mem.importance === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {mem.importance || 'medium'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {mem.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
                <span>{new Date(mem.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(mem)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit Memory"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteMemory(mem.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Memory Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold font-display text-white">
                {editingMemory ? 'Edit Memory' : 'Add New Memory'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Memory Content / Fact</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Proficient in React 19, FastAPI, PostgreSQL. Preferred coding style: clean functional TypeScript with strict typing."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Importance</label>
                  <select
                    value={importance}
                    onChange={(e) => setImportance(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="high">High (Always Injected)</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

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
                  {editingMemory ? 'Update Memory' : 'Save Memory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
