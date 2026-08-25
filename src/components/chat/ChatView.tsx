import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Copy, Check, RefreshCw, Square, 
  Mic, MicOff, Volume2, VolumeX, Sparkles, Code2, 
  Trash2, Edit3, Plus, Search, MessageSquare, Pin
} from 'lucide-react';
import { marked } from 'marked';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-sql';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { speechService } from '../../services/speechService';
import { ChatMessage } from '../../types';

export const ChatView: React.FC = () => {
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversationId,
    createConversation, 
    deleteConversation, 
    updateConversationTitle,
    messages, 
    addMessage, 
    updateMessageContent,
    profile, 
    memories, 
    settings,
    showToast,
    setCurrentSection 
  } = useApp();

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [showHistorySidebar, setShowHistorySidebar] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognizerRef = useRef<any>(null);
  const abortControllerRef = useRef<boolean>(false);

  const activeMessages: ChatMessage[] = activeConversationId ? (messages[activeConversationId] || []) : [];

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    Prism.highlightAll();
  }, [activeMessages, isGenerating]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isGenerating) return;

    let convId = activeConversationId;
    if (!convId) {
      convId = createConversation(textToSend.slice(0, 30));
    }

    // Add user message
    addMessage(convId, {
      conversationId: convId,
      role: 'user',
      content: textToSend
    });

    setInput('');
    setIsGenerating(true);
    abortControllerRef.current = false;

    // Placeholder assistant message
    const assistantMsg = addMessage(convId, {
      conversationId: convId,
      role: 'assistant',
      content: '',
      isStreaming: true
    });

    try {
      const history = activeMessages
        .filter(m => m.content && m.content.trim().length > 0 && m.id !== assistantMsg.id)
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content.trim() }));
      
      const response = await aiService.generateChatResponse(
        textToSend,
        history,
        { profile, memories, settings },
        (streamedChunk) => {
          if (abortControllerRef.current) return;
          updateMessageContent(convId, assistantMsg.id, streamedChunk);
        }
      );

      updateMessageContent(convId, assistantMsg.id, response);

      // Speak if enabled
      if (settings.voiceSynthesis) {
        speechService.speak(response);
      }
    } catch (err: any) {
      updateMessageContent(convId, assistantMsg.id, `⚠️ Error generating response: ${err.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStopGeneration = () => {
    abortControllerRef.current = true;
    setIsGenerating(false);
    showToast('Generation stopped', 'info');
  };

  const handleRegenerate = async () => {
    if (activeMessages.length === 0 || isGenerating) return;
    const lastUserMsg = [...activeMessages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleMic = () => {
    if (isListening) {
      speechRecognizerRef.current?.stop();
      setIsListening(false);
    } else {
      const recognizer = speechService.createSpeechRecognizer(
        (transcript) => setInput(transcript),
        (error) => {
          showToast(error, 'error');
          setIsListening(false);
        },
        () => setIsListening(false)
      );

      if (recognizer) {
        speechRecognizerRef.current = recognizer;
        recognizer.start();
        setIsListening(true);
        showToast('Listening... Speak your prompt', 'info');
      }
    }
  };

  const renderMarkdown = (content: string) => {
    if (!content) return { __html: '' };
    try {
      const parsed = marked.parse(content, { async: false }) as string;
      return { __html: parsed || content };
    } catch (e) {
      return { __html: content };
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const suggestedPrompts = [
    'Explain React 19 Actions vs useEffect with code',
    'Solve LeetCode: Longest Common Subsequence in C++',
    'Analyze my current project architecture & suggest improvements',
    'Write a 10-mark University answer on TCP/IP vs OSI Model'
  ];

  return (
    <div className="flex h-[calc(100vh-73px)] overflow-hidden bg-slate-950">
      
      {/* 1. Chat History Collapsible Sidebar */}
      <div className={`
        ${showHistorySidebar ? 'w-80' : 'w-0'} 
        transition-all duration-300 ease-in-out border-r border-slate-800/80 bg-slate-950/90 flex flex-col overflow-hidden shrink-0 hidden md:flex
      `}>
        {/* Top: New Chat & Search */}
        <div className="p-4 border-b border-slate-800/60 space-y-3">
          <button
            onClick={() => createConversation('New Chat')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredConversations.map((conv) => {
            const isActive = activeConversationId === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`
                  group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all
                  ${isActive 
                    ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'}
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="truncate">{conv.title}</span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newTitle = prompt('Rename chat:', conv.title);
                      if (newTitle) updateConversationTitle(conv.id, newTitle);
                    }}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this conversation?')) deleteConversation(conv.id);
                    }}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
        
        {/* Chat Header Status Bar */}
        <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistorySidebar(!showHistorySidebar)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800 hidden md:flex"
              title="Toggle sidebar"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-semibold text-slate-200 truncate max-w-xs sm:max-w-md">
              {conversations.find(c => c.id === activeConversationId)?.title || 'New Conversation'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div 
              onClick={() => setCurrentSection('settings')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] font-mono text-slate-300 cursor-pointer transition-colors"
              title="Click to configure AI Model & API Keys"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span className="font-semibold text-white uppercase">{settings.provider || 'gemini'}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{settings.model || 'gemini-2.5-flash'}</span>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {activeMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600/30">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold text-white">How can I assist you, {profile.name.split(' ')[0]}?</h3>
                <p className="text-sm text-slate-400">
                  I have full context of your B.Tech curriculum, current projects, skills ({profile.skills.slice(0, 4).join(', ')}), and career goals.
                </p>
              </div>

              {/* Suggested Prompts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-4">
                {suggestedPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p)}
                    className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800/80 hover:border-indigo-500/40 text-left text-xs text-slate-300 hover:text-white transition-all shadow-sm flex items-start gap-2.5"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            activeMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800/80 rounded-bl-none shadow-lg'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div 
                        className="markdown-content text-sm leading-relaxed"
                        dangerouslySetInnerHTML={renderMarkdown(msg.content || '...')}
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>

                  {/* Message Action Bar (Copy & Voice for Assistant) */}
                  {msg.role === 'assistant' && msg.content && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 pl-1">
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="flex items-center gap-1 hover:text-slate-300 transition-colors p-1"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => speechService.speak(msg.content)}
                        className="flex items-center gap-1 hover:text-slate-300 transition-colors p-1"
                        title="Listen to response"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Speak</span>
                      </button>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. Input & Control Bar */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto space-y-3">
            
            {/* Generating Controls */}
            {isGenerating && (
              <div className="flex justify-center">
                <button
                  onClick={handleStopGeneration}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30 transition-all shadow-sm"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop Generation</span>
                </button>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder={`Ask Kedar AI anything about coding, assignments, projects, or career...`}
                className="w-full pl-4 pr-24 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder-slate-500 resize-none shadow-inner transition-all outline-none"
              />

              <div className="absolute right-2.5 flex items-center gap-1.5">
                {/* Voice Input Mic */}
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-2 rounded-xl border transition-all ${
                    isListening 
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                  title={isListening ? 'Stop Listening' : 'Voice Input'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!input.trim() || isGenerating}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Press <strong className="text-slate-400">Enter</strong> to send, <strong className="text-slate-400">Shift + Enter</strong> for new line</span>
              <span>Memory Injection: <strong className="text-emerald-400">ON ({memories.length} facts active)</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
