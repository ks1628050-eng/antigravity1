import React, { useState } from 'react';
import { 
  Settings, User, Sliders, Database, 
  Download, Upload, RotateCcw, Check, Eye, EyeOff,
  Sparkles, ShieldCheck, Copy, ExternalLink, AlertCircle,
  IndianRupee, Key, QrCode, Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import { UserProfile, AISettings } from '../../types';
import { paymentService } from '../../services/paymentService';

export const SettingsView: React.FC = () => {
  const { profile, updateProfile, settings, updateSettings, showToast } = useApp();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'business' | 'data'>('profile');
  
  // Profile state
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
  const [upiId, setUpiId] = useState((profile as any).upiId || '');

  // AI settings state
  const [provider, setProvider] = useState<AISettings['provider']>(settings.provider);
  const [model, setModel] = useState(settings.model);
  const [temperature, setTemperature] = useState(settings.temperature);
  const [showKeyInstructions, setShowKeyInstructions] = useState(false);

  const envUPI = (import.meta as any).env?.VITE_OWNER_UPI_ID as string || '';
  const activeUPI = upiId || envUPI;
  const [qrPreviewAmount, setQrPreviewAmount] = useState(199);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...profile, name, email, education, branch, college, currentSemester: semester, targetRole, skills: skillsStr.split(',').map(s => s.trim()).filter(Boolean), currentProjects: projectsStr.split(',').map(p => p.trim()).filter(Boolean), bio, upiId } as any;
    updateProfile(updated);
  };

  const handleSaveAI = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ provider, model, temperature });
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
        <div className="flex flex-wrap items-center p-1.5 rounded-2xl bg-slate-950 border border-slate-800 self-start md:self-auto gap-0.5">
          {(['profile', 'ai', 'business', 'data'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'ai' ? 'AI & API Keys' : tab === 'business' ? '💰 Payments' : tab}
            </button>
          ))}
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5 text-emerald-400" />Your UPI ID (for student payments)</span>
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourname@okaxis or 9876543210@upi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">Students will scan a QR code linked to this UPI ID to pay you. Money goes directly to your bank — zero fees.</p>
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
            <h3 className="font-display font-bold text-lg text-white">AI Engine & API Keys</h3>
            <p className="text-xs text-slate-400 mt-1">Configure which AI powers your assistant. Provider credentials are stored only in Supabase Edge Function secrets.</p>
          </div>

          {/* Key Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border space-y-2 bg-slate-950 border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Google Gemini</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-500">Server secret</span>
              </div>
              <p className="text-[11px] text-slate-400">Free tier: 1,500 req/day • Best for students</p>
            </div>
            <div className="p-4 rounded-2xl border space-y-2 bg-slate-950 border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">OpenAI (GPT-4o)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-500">Server secret</span>
              </div>
              <p className="text-[11px] text-slate-400">$5 free credit for new accounts</p>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">How to Add Your API Key</span>
            </div>
            <ol className="text-[11px] text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Get a free Gemini API key from <a href="https://aistudio.google.com" target="_blank" className="text-indigo-400 font-mono">aistudio.google.com</a></li>
              <li>Create a file called <code className="font-mono text-amber-300">.env</code> in your project root folder (next to package.json)</li>
              <li>Set <code className="font-mono text-emerald-300">GEMINI_API_KEY</code> or <code className="font-mono text-emerald-300">OPENAI_API_KEY</code> as a Supabase Edge Function secret.</li>
              <li>Deploy the <code className="font-mono text-indigo-300">ai-chat</code> function and select the matching provider below.</li>
            </ol>
          </div>

          <form onSubmit={handleSaveAI} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Active AI Provider</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'mock', label: '🧠 Smart Offline Brain', desc: 'No key needed. Always available.', active: true },
                  { id: 'gemini', label: '✨ Google Gemini', desc: 'Requires server-side Gemini secret', active: true },
                  { id: 'openai', label: '🤖 OpenAI GPT', desc: 'Requires server-side OpenAI secret', active: true },
                ].map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setProvider(p.id as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                      provider === p.id 
                        ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-slate-100">{p.label}</h4>
                      {provider === p.id && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">{p.desc}</p>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${p.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                      {p.active ? '✓ Ready' : 'Needs Setup'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Model Name</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gemini-1.5-flash"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">Gemini: gemini-1.5-flash (fast) or gemini-1.5-pro (smarter) · OpenAI: gpt-4o-mini (cheap) or gpt-4o</p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Creativity / Temperature</span>
                <span className="font-mono text-indigo-400">{temperature}</span>
              </div>
              <input type="range" min="0.1" max="1.0" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button type="submit" className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20">
                Save AI Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. BUSINESS / PAYMENT TAB */}
      {activeTab === 'business' && (
        <div className="p-6 lg:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-display font-bold text-lg text-white">💰 Payment & Business Settings</h3>
            <p className="text-xs text-slate-400 mt-1">Set up your UPI ID to start collecting student payments. Preview how the QR code will look.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left — UPI Setup */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@okaxis or 9876543210@upi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Money goes directly to your bank. Zero platform fees.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preview Amount (₹)</label>
                <input
                  type="number"
                  value={qrPreviewAmount}
                  onChange={(e) => setQrPreviewAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={() => { const updated = { ...profile, upiId } as any; updateProfile(updated); showToast('UPI ID saved! QR codes updated.', 'success'); }}
                className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-md"
              >
                Save UPI ID
              </button>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                <p className="font-bold text-white">How to find your UPI ID:</p>
                <p>• GPay → Profile → UPI ID shown below your name</p>
                <p>• PhonePe → Profile → UPI ID</p>
                <p>• Paytm → Profile → UPI Settings</p>
                <p>• Bank app → UPI section → Your UPI handle</p>
              </div>
            </div>

            {/* Right — Live QR Preview */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <p className="text-xs font-semibold text-slate-300">Live QR Preview</p>
              {activeUPI ? (
                <>
                  <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-xl border-4 border-emerald-500/40">
                    <img
                      src={paymentService.getUPIQRCodeUrl(activeUPI, qrPreviewAmount, 'PRO Plan')}
                      alt="UPI QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-white">₹{qrPreviewAmount} → {activeUPI}</p>
                    <p className="text-[11px] text-slate-400">Students scan this to pay you directly</p>
                  </div>
                  <a
                    href={paymentService.generateUPILink(activeUPI, qrPreviewAmount, 'Test Payment')}
                    className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Test on your phone
                  </a>
                </>
              ) : (
                <div className="w-48 h-48 bg-slate-950 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center gap-2 text-slate-600">
                  <QrCode className="w-12 h-12" />
                  <p className="text-xs text-center">Enter your UPI ID to preview</p>
                </div>
              )}
            </div>
          </div>
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
