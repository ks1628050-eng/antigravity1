import React, { useState } from 'react';
import { 
  Settings, User, Sliders, Database, 
  Download, Upload, RotateCcw, Check, Eye, EyeOff,
  Sparkles, ShieldCheck, Copy, ExternalLink, AlertCircle,
  IndianRupee, Key, QrCode, Smartphone, Zap, CheckCircle2,
  Loader2, Cpu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import { UserProfile, AISettings, AIProvider } from '../../types';
import { paymentService } from '../../services/paymentService';
import { aiService, getApiKey } from '../../services/aiService';

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
  const [provider, setProvider] = useState<AIProvider>(settings.provider || 'gemini');
  const [model, setModel] = useState(settings.model || 'gemini-2.0-flash');
  const [temperature, setTemperature] = useState(settings.temperature ?? 0.7);
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey || '');
  const [groqApiKey, setGroqApiKey] = useState(settings.groqApiKey || '');
  const [openaiApiKey, setOpenaiApiKey] = useState(settings.openaiApiKey || '');
  const [openrouterApiKey, setOpenrouterApiKey] = useState(settings.openrouterApiKey || '');
  const [customPrompt, setCustomPrompt] = useState(settings.customSystemPrompt || '');

  // Key Visibility
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showOpenrouterKey, setShowOpenrouterKey] = useState(false);

  // Key Verification States
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

  const envUPI = (import.meta as any).env?.VITE_OWNER_UPI_ID as string || '';
  const activeUPI = upiId || envUPI;
  const [qrPreviewAmount, setQrPreviewAmount] = useState(199);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { 
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
      bio, 
      upiId 
    } as any;
    updateProfile(updated);
  };

  const handleSaveAI = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ 
      provider, 
      model, 
      temperature, 
      geminiApiKey, 
      groqApiKey, 
      openaiApiKey, 
      openrouterApiKey,
      customSystemPrompt: customPrompt
    });
    showToast('AI Settings & API keys saved to local vault!', 'success');
  };

  const handleTestConnection = async () => {
    setIsTestingKey(true);
    setTestResult(null);
    showToast(`Testing live connection to ${provider.toUpperCase()}...`, 'info');

    const activeKey = provider === 'gemini' ? geminiApiKey 
      : provider === 'groq' ? groqApiKey 
      : provider === 'openai' ? openaiApiKey 
      : openrouterApiKey;

    const result = await aiService.testAPIConnection(provider, activeKey, model);
    setIsTestingKey(false);
    setTestResult({
      success: result.success,
      message: result.message,
      latency: result.latencyMs
    });

    if (result.success) {
      showToast(`Connection Verified! (${result.latencyMs}ms)`, 'success');
    } else {
      showToast(`Test Failed: ${result.message}`, 'error');
    }
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

  const modelPresets: Record<string, { model: string; label: string; desc: string }[]> = {
    gemini: [
      { model: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', desc: 'Next-gen lightning speed, multimodal & real-time' },
      { model: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', desc: 'Enhanced reasoning, low latency & deep context' },
      { model: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', desc: 'Complex reasoning, 2M token context, deep code math' },
      { model: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', desc: 'Fast, cost-efficient, 1M token window' }
    ],
    groq: [
      { model: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile', desc: 'Ultra-fast 800+ tokens/sec, near-GPT-4 intelligence' },
      { model: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant', desc: 'Sub-100ms response time, excellent for quick chat' },
      { model: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill 70B', desc: 'Advanced step-by-step mathematical reasoning' }
    ],
    openai: [
      { model: 'gpt-4o', label: 'GPT-4o Flagship', desc: 'High intelligence, comprehensive coding depth' },
      { model: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Fast, efficient, high accuracy' },
      { model: 'o3-mini', label: 'o3-mini Reasoning', desc: 'STEM and coding logic specialist' }
    ],
    openrouter: [
      { model: 'deepseek/deepseek-r1', label: 'DeepSeek R1', desc: 'Open reasoning powerhouse with transparent thinking' },
      { model: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', desc: 'Benchmark coding & architectural generation' }
    ],
    mock: [
      { model: 'smart-offline-brain', label: 'Smart Contextual Brain', desc: 'Pre-loaded student knowledge, zero API key required' }
    ]
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Settings className="w-3.5 h-3.5" />
            <span>Preferences & API Credentials</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">System Settings & Profile</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Configure real AI models (Google Gemini, Groq, OpenAI, OpenRouter), enter custom API keys, customize your personal student profile, and manage data backups.
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
              {tab === 'ai' ? '🤖 AI Models & Keys' : tab === 'business' ? '💰 Payments' : tab === 'data' ? '💾 Backup & Data' : '👤 Profile'}
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
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-lg text-white">AI Engine & Multi-Model Credentials</h3>
              <p className="text-xs text-slate-400 mt-1">Configure direct browser API keys or choose from fast inference providers. Keys are stored safely in local storage.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✓ Client Streaming Ready
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveAI} className="space-y-6">
            
            {/* Provider Selection Cards */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2.5">Select Active LLM Provider</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { id: 'gemini', label: 'Google Gemini', badge: 'Recommended', desc: 'Gemini 2.5 / 2.0 Flash & Pro models', color: 'border-indigo-500/40 text-indigo-400' },
                  { id: 'groq', label: 'Groq Cloud', badge: 'Ultra Fast', desc: 'Llama 3.3 70B & DeepSeek R1 Distill', color: 'border-amber-500/40 text-amber-400' },
                  { id: 'openai', label: 'OpenAI', badge: 'GPT-4o', desc: 'GPT-4o, GPT-4o-mini, o3-mini', color: 'border-emerald-500/40 text-emerald-400' },
                  { id: 'openrouter', label: 'OpenRouter', badge: 'Multi-LLM', desc: 'DeepSeek-R1, Claude 3.5, Gemini', color: 'border-purple-500/40 text-purple-400' },
                ].map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setProvider(p.id as any);
                      const defaultModel = modelPresets[p.id]?.[0]?.model || 'gemini-2.0-flash';
                      setModel(defaultModel);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1.5 relative ${
                      provider === p.id 
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-xl shadow-indigo-950/50'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-xs text-slate-100">{p.label}</h4>
                      {provider === p.id && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{p.desc}</p>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 bg-slate-900 border border-slate-800 ${p.color}`}>
                      {p.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Provider API Key Inputs */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              
              {/* Gemini Key */}
              {provider === 'gemini' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Google Gemini API Key</span>
                    </label>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1">
                      Get Free Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="AIzaSy... (or set VITE_GEMINI_API_KEY)"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">Free tier: 1,500 requests/day. Leave blank to use smart offline engine.</p>
                </div>
              )}

              {/* Groq Key */}
              {provider === 'groq' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>Groq API Key (Free & Ultra Fast)</span>
                    </label>
                    <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-[11px] text-amber-400 hover:underline flex items-center gap-1">
                      Get Free Groq Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showGroqKey ? 'text' : 'password'}
                      value={groqApiKey}
                      onChange={(e) => setGroqApiKey(e.target.value)}
                      placeholder="gsk_... (or set VITE_GROQ_API_KEY)"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGroqKey(!showGroqKey)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showGroqKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">Free tier: 30 requests/minute. Blazing fast inference (800+ tokens/sec).</p>
                </div>
              )}

              {/* OpenAI Key */}
              {provider === 'openai' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-emerald-400" />
                      <span>OpenAI API Key</span>
                    </label>
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1">
                      Get Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showOpenaiKey ? 'text' : 'password'}
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      placeholder="sk-proj-... (or set VITE_OPENAI_API_KEY)"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showOpenaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* OpenRouter Key */}
              {provider === 'openrouter' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-purple-400" />
                      <span>OpenRouter API Key</span>
                    </label>
                    <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-[11px] text-purple-400 hover:underline flex items-center gap-1">
                      Get Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showOpenrouterKey ? 'text' : 'password'}
                      value={openrouterApiKey}
                      onChange={(e) => setOpenrouterApiKey(e.target.value)}
                      placeholder="sk-or-v1-... (or set VITE_OPENROUTER_API_KEY)"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenrouterKey(!showOpenrouterKey)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showOpenrouterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Live Connection Test Button */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingKey}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors disabled:opacity-50"
                >
                  {isTestingKey ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{isTestingKey ? 'Pinging API...' : 'Test & Verify Connection'}</span>
                </button>

                {testResult && (
                  <div className={`text-xs flex items-center gap-2 ${testResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{testResult.message} {testResult.latency ? `(${testResult.latency}ms)` : ''}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Model Presets & Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Model Selection</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {(modelPresets[provider] || modelPresets.gemini).map((preset) => (
                  <div
                    key={preset.model}
                    onClick={() => setModel(preset.model)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1 ${
                      model === preset.model
                        ? 'bg-indigo-950/40 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-200">{preset.label}</span>
                      {model === preset.model && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <p className="text-[10px] text-slate-500">{preset.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Or enter custom model ID..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Temperature Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Creativity / Temperature</span>
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
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Precise & Deterministic (0.1)</span>
                <span>Balanced (0.7)</span>
                <span>Creative & Novel (1.0)</span>
              </div>
            </div>

            {/* Custom System Prompt */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Custom System Instruction (Optional)</label>
              <textarea
                rows={3}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Customize the default personality and instructions..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none resize-none leading-relaxed focus:border-indigo-500"
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

      {/* 4. DATA BACKUP TAB */}
      {activeTab === 'data' && (
        <div className="p-6 lg:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-display font-bold text-lg text-white">Data Management & Full Offline Backup</h3>
            <p className="text-xs text-slate-400 mt-1">Export all your stored memories, tasks, conversations, and custom settings as a portable JSON file.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <Download className="w-6 h-6 text-indigo-400 mb-2" />
                <h4 className="font-bold text-sm text-white">Export Backup</h4>
                <p className="text-xs text-slate-400 mt-1">Download complete JSON snapshot of all your data.</p>
              </div>
              <button
                onClick={handleExportData}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md"
              >
                Export JSON
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <Upload className="w-6 h-6 text-emerald-400 mb-2" />
                <h4 className="font-bold text-sm text-white">Restore Backup</h4>
                <p className="text-xs text-slate-400 mt-1">Load previously exported JSON backup file.</p>
              </div>
              <label className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white text-center cursor-pointer block">
                <span>Select File</span>
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <RotateCcw className="w-6 h-6 text-red-400 mb-2" />
                <h4 className="font-bold text-sm text-white">Reset System</h4>
                <p className="text-xs text-slate-400 mt-1">Restore factory demo data and reset all tables.</p>
              </div>
              <button
                onClick={handleResetData}
                className="w-full py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
