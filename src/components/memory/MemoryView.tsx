import React, { useState } from 'react';
import { 
  Brain, Plus, Trash2, Edit3, Sparkles, CheckCircle2, 
  ShieldCheck, Filter, Database, Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MemoryItem } from '../../types';

export const MemoryView: React.FC = () => {
  const { memories, addMemory, updateMemory, deleteMemory, showToast } = useApp();
  
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<MemoryItem['category']>('skills');

  const openCreateModal = () => {
    setEditingMemory(null);
    setContent('');
    setCategory('skills');
    setIsModalOpen(true);
  };

  const openEditModal = (mem: MemoryItem) => {
    setEditingMemory(mem);
    setContent(mem.content);
    setCategory(mem.category);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (editingMemory) {
      updateMemory({
        ...editingMemory,
        content,
        category
      });
    } else {
      addMemory({
        content,
        category
      });
    }
    setIsModalOpen(false);
  };

  const filteredMemories = memories.filter(m => {
    if (filterCategory !== 'all' && m.category !== filterCategory) return false;
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
            Information saved here is automatically injected into prompt context, enabling personalized responses tailored to your skills, goals, and coding preferences.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Memory</span>
        </button>
      </div>

      {/* Memory Status & Filter Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Context Injection Active: <strong>{memories.length} Stored Facts</strong></span>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="skills">Technical Skills</option>
              <option value="career">Career Aspirations</option>
              <option value="projects">Current Projects</option>
              <option value="preferences">Learning Preferences</option>
              <option value="academic">Academic Context</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>

        {/* Memory Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {mem.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(mem.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  "{mem.content}"
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
                <button
                  onClick={() => openEditModal(mem)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  title="Edit Memory"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteMemory(mem.id)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                  title="Delete Memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Memory Modal (Create / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 animate-scaleUp">
            <h3 className="font-display font-bold text-xl text-white">
              {editingMemory ? 'Edit Memory' : 'Add New Fact to Memory'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Memory Content *</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="e.g. Kedar is learning Rust for building distributed databases..."
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-100 placeholder-slate-500 outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
                >
                  <option value="skills">Technical Skills</option>
                  <option value="career">Career Aspirations</option>
                  <option value="projects">Current Projects</option>
                  <option value="preferences">Learning Preferences</option>
                  <option value="academic">Academic Context</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
                >
                  {editingMemory ? 'Save Changes' : 'Store Memory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
