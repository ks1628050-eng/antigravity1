import React, { useState } from 'react';
import { 
  Settings, User, Sliders, Database, 
  Download, Upload, RotateCcw, Check, Eye, EyeOff,
  Sparkles, ShieldCheck, Sun, Moon, Volume2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import { UserProfile, AISettings } from '../../types';

export const SettingsView: React.FC = () => {
  const { profile, updateProfile, settings, updateSettings, showToast } = useApp();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'data'>('profile');
  
  // Profile form state
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [education, setEducation] = useState(profile.education);
  const [branch, setBranch] = useState(profile.branch);
  const [college, setCollege] = useState(profile.college);
  const [semester, setSemester] = useState(profile.currentSemester);
  const [targetRole, setTargetRole] = useState(profile.targetRole);
  const [skillsStr, setSkillsStr] = useState(profile.skills.join(', '));
  const [projectsStr, setProjectsStr] = useState(profile.currentProjects.join(', '));
  const [bio, setBio] = useState(profile.bio);

  // AI settings state
  const [provider, setProvider] = useState<AISettings['provider']>(settings.provider);
  const [model, setModel] = useState(settings.model);
  const [temperature, setTemperature] = useState(settings.temperature);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name,
      email,
      education,
      branch,
      college,
      currentSemester: semester,
      targetRole,
      skills: skillsStr.split(',').map(s => s.trim()).filter(Boolean),
      currentProjects: projectsStr.split(',').map(p => p.trim()).filter(Boolean),
      bio
    };
    updateProfile(updated);
  };

  const handleSaveAI = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      provider,
      apiKey: '',
      model,
      temperature
    });
  };

  const handleExportData = () => {
    const json = storageService.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kedar-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Backup JSON exported!', 'success');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storageService.importAllData(content);
      if (success) {
        showToast('Backup restored successfully! Reloading...', 'success');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        showToast('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data to default demo state?')) {
      storageService.resetToDefaults();
      showToast('Reset to default demo data! Reloading...', 'info');
      setTimeout(() => window.location.reload(), 1200);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Settings className="w-3.5 h-3.5" />
            <span>Preferences & Credentials</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">System Settings & Profile</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Configure your AI keys, customize your personal student profile, and manage data backups.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center p-1.5 rounded-2xl bg-slate-950 border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Models & Keys
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'data' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Data Backup
          </button>
        </div>
      </div>

      {/* 1. PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="p-6 lg:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-display font-bold text-lg text-white">Personal Profile & Context</h3>
            <p className="text-xs text-slate-400 mt-1">This profile information is used to personalize all AI answers, recommendations, and study roadmaps.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Degree / Education</label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Branch / Specialization</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Semester</label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">College / University</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Core Technical Skills (comma separated)</label>
              <input
                type="text"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Key Projects (comma separated)</label>
              <input
                type="text"
                value={projectsStr}
                onChange={(e) => setProjectsStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Short Bio & Engineering Philosophy</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. AI MODELS & KEYS TAB */}
      {activeTab === 'ai' && (
        <div className="p-6 lg:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-display font-bold text-lg text-white">AI Engine & Model Provider</h3>
            <p className="text-xs text-slate-400 mt-1">Choose a provider. Live model credentials are managed securely on the server; the offline engine remains available without an account.</p>
          </div>

          <form onSubmit={handleSaveAI} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select AI Provider</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'mock', label: 'Smart Offline Brain', desc: 'No API key needed, zero-cost, immediate high-accuracy responses.' },
                  { id: 'gemini', label: 'Google Gemini', desc: 'Direct Gemini 1.5 Flash / Gemini 2.0 Flash REST connection.' },
                  { id: 'openai', label: 'OpenAI', desc: 'Connect GPT-4o-mini or GPT-4o with your OpenAI API Key.' },
                ].map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setProvider(p.id as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                      provider === p.id 
                        ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-lg shadow-indigo-950/40' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-slate-100">{p.label}</h4>
                      {provider === p.id && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {provider !== 'mock' && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Server-side credentials
                  </label>
                  <div className="px-4 py-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200">
                    API keys are kept in Supabase Edge Function secrets and are never entered or stored in this browser.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Model Name</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="gemini-1.5-flash"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Creativity & Temperature</span>
                <span className="font-mono text-indigo-400">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
              >
                Save AI Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. DATA BACKUP TAB */}
      {activeTab === 'data' && (
        <div className="p-6 lg:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-display font-bold text-lg text-white">Data Management & Portability</h3>
            <p className="text-xs text-slate-400 mt-1">Export your entire Kedar AI brain, restore previous backups, or reset to factory demo state.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Backup</span>
              </h4>
              <p className="text-xs text-slate-400">Download a full JSON file containing tasks, memories, roadmaps, chats, and business blueprints.</p>
              <button
                onClick={handleExportData}
                className="w-full py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-colors"
              >
                Download JSON
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Restore Backup</span>
              </h4>
              <p className="text-xs text-slate-400">Upload a previously exported JSON backup file to restore all your stored context.</p>
              <label className="block w-full text-center py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold text-xs transition-colors cursor-pointer">
                Upload Backup File
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>Reset to Defaults</span>
              </h4>
              <p className="text-xs text-slate-400">Restore the original initial state with curated demo tasks, memories, and learning roadmaps.</p>
              <button
                onClick={handleResetData}
                className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold text-xs transition-colors"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
