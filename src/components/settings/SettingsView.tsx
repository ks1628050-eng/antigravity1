import React, { useState } from 'react';
import { 
  Settings, User, Sliders, Database, 
  Download, Upload, RotateCcw, Check, Eye, EyeOff,
  Sparkles, ShieldCheck, Copy, ExternalLink, AlertCircle,
  IndianRupee, Key, QrCode, Smartphone, Zap, CheckCircle2,
  Loader2, Cpu, Sun, Moon, Palette, Volume2, VolumeX, Brain
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import { UserProfile, AISettings, AIProvider } from '../../types';
import { paymentService } from '../../services/paymentService';
import { aiService, getApiKey } from '../../services/aiService';

export const SettingsView: React.FC = () => {
  const { profile, updateProfile, settings, updateSettings, showToast } = useApp();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'appearance' | 'business' | 'data'>('profile');
  
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
  const [activeTheme, setActiveTheme] = useState<'dark' | 'light'>(settings.theme || 'dark');
  const [voiceSynthesis, setVoiceSynthesis] = useState<boolean>(settings.voiceSynthesis ?? true);
  const [autoSaveMemory, setAutoSaveMemory] = useState<boolean>(settings.autoSaveMemory ?? true);

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
      if (result.activeModel && result.activeModel !== model) {
        setModel(result.activeModel);
      }
      showToast(`Connection Verified with ${result.activeModel || model}! (${result.latencyMs}ms)`, 'success');
    } else {
      showToast(`Test Failed: ${result.message}`, 'error');
    }
  };

  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [liveModels, setLiveModels] = useState<string[]>([]);

  const handleFetchLiveModels = async () => {
    setIsFetchingModels(true);
    showToast(`Querying ${provider.toUpperCase()} for active models...`, 'info');

    const activeKey = provider === 'gemini' ? geminiApiKey 
      : provider === 'groq' ? groqApiKey 
      : provider === 'openai' ? openaiApiKey 
      : openrouterApiKey;

    const res = await aiService.fetchAvailableModels(provider, activeKey);
    setIsFetchingModels(false);
    if (res.success && res.models.length > 0) {
      setLiveModels(res.models);
      showToast(`Loaded ${res.models.length} active models from ${provider.toUpperCase()}!`, 'success');
      if (!res.models.includes(model)) {
        setModel(res.models[0]);
      }
    } else {
      showToast(res.message || 'Failed to fetch live catalog', 'error');
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
    'kedar-ai': [
      { model: 'kedar-ai-pro-v1', label: 'Kedar AI Pro (v1.0)', desc: 'Autonomous neural cognitive engine & multi-agent swarm router' },
      { model: 'kedar-ai-coder-2026', label: 'Kedar AI Coder 2026', desc: 'Specialized for Python 3.12, Modern C++20, and Big-O derivations' },
      { model: 'kedar-ai-academic-10m', label: 'Kedar AI Academic Solver', desc: 'Tuned for 10-mark university exams, ASCII diagrams, and oral viva' },
      { model: 'kedar-ai-agent-swarm', label: 'Kedar AI Autonomous Swarm', desc: 'Architect, Engineer, QA Auditor, and Cloud DevOps 4-tier pipeline' }
    ],
    gemini: [
      { model: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Recommended)', desc: 'Next-gen flagship, multimodal, ultra-fast & low latency' },
      { model: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', desc: 'Complex reasoning, deep STEM mathematics & code generation' },
      { model: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', desc: 'High-speed production model, 1M token context window' },
      { model: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', desc: 'Deep contextual reasoning with 2M token context' }
    ],
    groq: [
      { model: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant (Ultra Fast)', desc: 'Sub-100ms response time, 800+ tokens/sec on Groq LPU' },
      { model: 'llama3-70b-8192', label: 'Meta Llama 3 70B', desc: 'Production 70B model, deep programming intelligence' },
      { model: 'llama3-8b-8192', label: 'Meta Llama 3 8B', desc: 'Fast, lightweight open-weights on Groq hardware' },
      { model: 'gemma2-9b-it', label: 'Google Gemma 2 9B', desc: 'Google next-gen open weights running on Groq LPU' },
      { model: 'gpt-oss-120b', label: 'GPT-OSS 120B', desc: 'OpenAI open-weight 120B high intelligence model on Groq' }
    ],
    openai: [
      { model: 'gpt-4o', label: 'GPT-4o Flagship', desc: 'High intelligence, comprehensive multi-domain coding depth' },
      { model: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Fast, cost-efficient, high accuracy for general queries' },
      { model: 'o3-mini', label: 'o3-mini Reasoning', desc: 'STEM, algorithmic, and mathematical logic specialist' },
      { model: 'o1', label: 'o1 Advanced Reasoning', desc: 'Deep scientific and complex algorithmic synthesis' }
    ],
    openrouter: [
      { model: 'deepseek/deepseek-r1', label: 'DeepSeek R1', desc: 'Open reasoning powerhouse with transparent step-by-step thinking' },
      { model: 'deepseek/deepseek-chat', label: 'DeepSeek V3 (671B)', desc: 'Frontier performance across code and language synthesis' },
      { model: 'meta-llama/llama-3.3-70b-instruct', label: 'Meta Llama 3.3 70B', desc: 'High intelligence open-weight flagship on OpenRouter' },
      { model: 'meta-llama/llama-3.2-3b-instruct:free', label: 'Llama 3.2 (100% Free)', desc: 'Zero credit required on OpenRouter free tier' },
      { model: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', desc: 'Top tier coding & architectural reasoning' }
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
        <div className="flex flex-wrap items-center p-1.5 rounded-2xl bg-slate-950 border border-slate-800 self-start md:self-auto gap-1">
          {(['profile', 'ai', 'appearance', 'business', 'data'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'ai' ? '🤖 AI Models & Keys' :
               tab === 'appearance' ? '☀️ / 🌙 Appearance' :
               tab === 'business' ? '💰 Payments' :
               tab === 'data' ? '💾 Backup & Data' : '👤 Profile'}
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
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department / Branch</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. CSE / AIML / ECE / IT"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Semester</label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="e.g. 6th Semester"
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
                  placeholder="e.g. IIT Bombay / VTU / JNTU / SPPU"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Role / Career Goal</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Full Stack AI Engineer / SDE-1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Key Technical Skills (comma separated)</label>
              <input
                type="text"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                placeholder="React, TypeScript, Python, C++, Node.js, SQL, Docker, AWS"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Active Projects</label>
              <input
                type="text"
                value={projectsStr}
                onChange={(e) => setProjectsStr(e.target.value)}
                placeholder="Kedar AI Workspace, Autonomous Agent Swarm, Lab Practical Solver"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Professional Bio & Academic Aspirations</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell AI about your learning style, upcoming exams, placement goals, or coding challenges..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none resize-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button 
                type="submit" 
                className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. AI ENGINE TAB */}
      {activeTab === 'ai' && (
        <div className="p-6 lg:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-display font-bold text-lg text-white">AI Engine, Providers & API Keys</h3>
            <p className="text-xs text-slate-400 mt-1">Configure your LLM provider and API keys. Keys are saved securely in your browser vault.</p>
          </div>

          <form onSubmit={handleSaveAI} className="space-y-6">
            
            {/* Provider Selector Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Active AI Intelligence Provider</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {[
                  { id: 'gemini', name: 'Google Gemini', badge: 'Fast & Multimodal', color: 'from-blue-600 to-cyan-600', icon: Sparkles },
                  { id: 'groq', name: 'Groq Cloud', badge: 'Ultra-Fast LPU', color: 'from-orange-600 to-amber-600', icon: Zap },
                  { id: 'openai', name: 'OpenAI GPT', badge: 'Reasoning & Coding', color: 'from-emerald-600 to-teal-600', icon: Cpu },
                  { id: 'openrouter', name: 'OpenRouter', badge: 'DeepSeek / Claude', color: 'from-purple-600 to-pink-600', icon: Sliders },
                  { id: 'kedar-ai', name: 'Kedar AI Offline', badge: 'No Key Required', color: 'from-indigo-600 to-purple-600', icon: ShieldCheck }
                ].map(p => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setProvider(p.id as any);
                        const defaultM = modelPresets[p.id]?.[0]?.model || 'gemini-2.0-flash';
                        setModel(defaultM);
                        setTestResult(null);
                        setLiveModels([]);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        provider === p.id 
                          ? 'bg-slate-950 border-indigo-500 shadow-md ring-1 ring-indigo-500/50' 
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-4 h-4 ${provider === p.id ? 'text-indigo-400' : 'text-slate-400'}`} />
                        {provider === p.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-white">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.badge}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* API Key Input */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  {provider.toUpperCase()} API Key Configuration
                </span>
                <span className="text-[10px] text-slate-400">
                  {provider === 'kedar-ai' ? 'Autonomous Offline Engine' : 'Stored locally in browser vault'}
                </span>
              </div>

              {provider === 'gemini' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-slate-300 font-semibold">Google Gemini API Key</label>
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      Get Free Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={geminiApiKey}
                      onChange={(e) => { setGeminiApiKey(e.target.value); setTestResult(null); }}
                      placeholder="AIzaSy..."
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
                </div>
              )}

              {provider === 'groq' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-slate-300 font-semibold">Groq Cloud API Key</label>
                    <a 
                      href="https://console.groq.com/keys" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                    >
                      Get Groq Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showGroqKey ? 'text' : 'password'}
                      value={groqApiKey}
                      onChange={(e) => { setGroqApiKey(e.target.value); setTestResult(null); }}
                      placeholder="gsk_..."
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
                </div>
              )}

              {provider === 'openai' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-slate-300 font-semibold">OpenAI API Key</label>
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Get OpenAI Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showOpenaiKey ? 'text' : 'password'}
                      value={openaiApiKey}
                      onChange={(e) => { setOpenaiApiKey(e.target.value); setTestResult(null); }}
                      placeholder="sk-proj-..."
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

              {provider === 'openrouter' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-slate-300 font-semibold">OpenRouter API Key</label>
                    <a 
                      href="https://openrouter.ai/keys" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
                    >
                      Get OpenRouter Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showOpenrouterKey ? 'text' : 'password'}
                      value={openrouterApiKey}
                      onChange={(e) => { setOpenrouterApiKey(e.target.value); setTestResult(null); }}
                      placeholder="sk-or-v1-..."
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

              {/* Curated Presets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(modelPresets[provider] || []).map((preset) => (
                  <button
                    key={preset.model}
                    type="button"
                    onClick={() => setModel(preset.model)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      model === preset.model
                        ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-white">{preset.label}</span>
                      {model === preset.model && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">{preset.desc}</p>
                    <span className="inline-block mt-2 font-mono text-[10px] text-indigo-300/80 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {preset.model}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom System Prompt */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Custom System Prompt Instructions (Optional)
              </label>
              <textarea
                rows={3}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Customize the default personality and instructions..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none resize-none focus:border-indigo-500"
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

      {/* 3. APPEARANCE & THEME TAB (SUN / MOON) */}
      {activeTab === 'appearance' && (
        <div className="p-6 lg:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-400" />
                <span>Appearance, Theme & Audio Preferences</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Switch between Sun (Modern Light) and Moon (Cyber Dark Mode), toggle audio narration, and customize intelligence preferences.</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Theme: {activeTheme === 'dark' ? 'Moon 🌙 Dark' : 'Sun ☀️ Light'}</span>
            </div>
          </div>

          {/* Theme Selection Cards */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">Choose Interface Theme</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dark Cyber Card */}
              <div 
                onClick={() => {
                  setActiveTheme('dark');
                  updateSettings({ theme: 'dark' });
                  showToast('Dark Cyber Theme activated (Moon 🌙)!', 'success');
                }}
                className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 relative group flex flex-col justify-between ${
                  activeTheme === 'dark'
                    ? 'bg-slate-950 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 flex items-center gap-2">
                      <Moon className="w-5 h-5 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-200">Cyber Dark (Moon 🌙)</span>
                    </div>
                    {activeTheme === 'dark' && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                        <Check className="w-3 h-3" /> ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    High-contrast deep space slate (#080d1a) with neon glowing accents, ideal for night coding and reduced eye strain.
                  </p>
                </div>
                {/* Visual mini-preview */}
                <div className="mt-4 p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <div className="h-2 flex-1 rounded bg-slate-800" />
                  <div className="h-2 w-12 rounded bg-indigo-500/40" />
                </div>
              </div>

              {/* Light Mode Card */}
              <div 
                onClick={() => {
                  setActiveTheme('light');
                  updateSettings({ theme: 'light' });
                  showToast('Modern Crisp Light Theme activated (Sun ☀️)!', 'success');
                }}
                className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 relative group flex flex-col justify-between ${
                  activeTheme === 'light'
                    ? 'bg-slate-100 border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/30 text-slate-900'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-300 text-amber-500 flex items-center gap-2 shadow-sm">
                      <Sun className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-bold text-slate-800">Modern Light (Sun ☀️)</span>
                    </div>
                    {activeTheme === 'light' && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 text-[10px] font-bold border border-amber-500/30">
                        <Check className="w-3 h-3" /> ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 group-hover:text-slate-600">
                    Clean, bright operational console (#f8fafc) with sharp typography, excellent daylight readability, and crisp borders.
                  </p>
                </div>
                {/* Visual mini-preview */}
                <div className="mt-4 p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 shadow-inner">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="h-2 flex-1 rounded bg-slate-200" />
                  <div className="h-2 w-12 rounded bg-amber-500/40" />
                </div>
              </div>
            </div>
          </div>

          {/* Audio & Memory Preferences */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Audio & Intelligence Toggles</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Voice toggle */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {voiceSynthesis ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Voice Synthesis & Audio</span>
                    <span className="text-[11px] text-slate-400">Read AI answers and viva questions aloud</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={voiceSynthesis}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setVoiceSynthesis(val);
                    updateSettings({ voiceSynthesis: val });
                    showToast(val ? 'Voice Audio Enabled' : 'Voice Audio Muted', 'info');
                  }}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Auto-save memory toggle */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Auto-Save Memories</span>
                    <span className="text-[11px] text-slate-400">Extract facts automatically from chat</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoSaveMemory}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setAutoSaveMemory(val);
                    updateSettings({ autoSaveMemory: val });
                    showToast(val ? 'Auto Memory Active' : 'Auto Memory Paused', 'info');
                  }}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                updateSettings({ theme: activeTheme, voiceSynthesis, autoSaveMemory });
                showToast('Preferences saved successfully!', 'success');
              }}
              className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md"
            >
              Save Appearance Settings
            </button>
          </div>
        </div>
      )}

      {/* 4. BUSINESS / PAYMENT TAB */}
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
