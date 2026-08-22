import React, { useState } from 'react';
import { 
  PenTool, Sparkles, Copy, Check, Share2, 
  FileText, Save, Trash2, Sliders, RefreshCw,
  Video, MessageSquare, Globe, Hash
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { ContentPost } from '../../types';

export const ContentView: React.FC = () => {
  const { profile, memories, settings, contentPosts, addContentPost, deleteContentPost, showToast } = useApp();
  
  const [platform, setPlatform] = useState<ContentPost['platform']>('linkedin');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<ContentPost['tone']>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    showToast(`Generating ${tone} ${platform} content...`, 'info');

    const prompt = `Write a high-engagement ${tone} post for ${platform.toUpperCase()} on the topic: "${topic}".
Context: Written by ${profile.name}, a B.Tech student and developer specializing in ${profile.skills.slice(0, 4).join(', ')}.
Tone: ${tone}
Include strong hook, clear bullet points, actionable takeaways, and 4-5 relevant hashtags.`;

    try {
      const result = await aiService.generateChatResponse(
        prompt,
        [],
        { profile, memories, settings }
      );
      setGeneratedText(result);
      showToast('Content drafted successfully!', 'success');
    } catch (err) {
      showToast('Failed to generate content', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToVault = () => {
    if (!generatedText.trim()) return;
    const newPost: ContentPost = {
      id: `post-${Date.now()}`,
      platform,
      topic,
      tone,
      generatedContent: generatedText,
      hashtags: ['#Tech', '#Engineering', '#AI', '#Nextjs'],
      createdAt: new Date().toISOString()
    };
    addContentPost(newPost);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-950/70 via-slate-900/90 to-indigo-950/70 border border-pink-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold border border-pink-500/30">
            <PenTool className="w-3.5 h-3.5" />
            <span>Personal Branding & Content Studio</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">Content Studio</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Generate high-converting posts for LinkedIn, Twitter/X, Instagram, and YouTube across 6 distinctive voice tones.
          </p>
        </div>
      </div>

      {/* Generator & Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Configuration Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
            <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-pink-400" />
              <span>Target Platform & Topic</span>
            </h3>

            {/* Platform Selector Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Platform</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'linkedin', label: 'LinkedIn', icon: <Share2 className="w-4 h-4 text-blue-400" /> },
                  { id: 'twitter', label: 'X / Twitter', icon: <MessageSquare className="w-4 h-4 text-cyan-400" /> },
                  { id: 'instagram', label: 'Instagram', icon: <Hash className="w-4 h-4 text-pink-400" /> },
                  { id: 'youtube', label: 'YouTube Script', icon: <Video className="w-4 h-4 text-rose-500" /> },
                  { id: 'blog', label: 'Tech Blog', icon: <FileText className="w-4 h-4 text-amber-400" /> },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      platform === p.id 
                        ? 'bg-pink-950/40 border-pink-500 text-white shadow-md shadow-pink-950/50' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {p.icon}
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Voice Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 outline-none"
              >
                <option value="professional">Professional & Technical</option>
                <option value="casual">Casual & Conversational</option>
                <option value="viral">Viral / High-Engagement Hook</option>
                <option value="educational">Educational / Step-by-Step</option>
                <option value="motivational">Motivational / Builder Mindset</option>
                <option value="hinglish">Hinglish (Hindi + English Native)</option>
              </select>
            </div>

            {/* Topic Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Topic or Core Idea *</label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. How I built an Autonomous AI Assistant in 3rd year B.Tech, or 5 common mistakes in React 19..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-pink-500 text-xs text-slate-100 placeholder-slate-500 outline-none resize-none leading-relaxed"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating}
              className="w-full py-3 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-md shadow-pink-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Generating Content...' : 'Generate Post'}</span>
            </button>
          </div>
        </div>

        {/* Right: Editable Canvas & Save (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 min-h-[460px] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 uppercase">
                  {platform} • {tone}
                </span>
              </div>

              {generatedText && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleSaveToVault}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save to Vault</span>
                  </button>
                </div>
              )}
            </div>

            {/* Editable Content Canvas */}
            <textarea
              rows={14}
              value={generatedText}
              onChange={(e) => setGeneratedText(e.target.value)}
              placeholder="Your generated content will appear here for live editing..."
              className="w-full flex-1 p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-200 focus:border-pink-500 outline-none leading-relaxed resize-none font-sans"
            />
          </div>
        </div>

      </div>

    </div>
  );
};
