import React, { useState, useEffect } from 'react';
import { 
  Code2, Play, Bug, Sparkles, Copy, Check, Download, 
  RefreshCw, Terminal, Layers, FileCode, CheckCircle2,
  Send, Wand2, Zap, ArrowRight
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
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';

const defaultCodes: Record<string, string> = {
  python: `# Python 3.12: LRU Cache Implementation with Doubly Linked List
class Node:
    def __init__(self, key: int, val: int):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}
        self.head, self.tail = Node(0, 0), Node(0, 0)
        self.head.next, self.tail.prev = self.tail, self.head

    def get(self, key: int) -> int:
        if key in self.cache:
            node = self.cache[key]
            self._remove(node)
            self._insert(node)
            return node.val
        return -1

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, value)
        self.cache[key] = node
        self._insert(node)
        if len(self.cache) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]

    def _remove(self, node: Node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _insert(self, node: Node):
        node.next, node.prev = self.head.next, self.head
        self.head.next.prev = self.head.next = node`,

  cpp: `// C++20: Dijkstra's Algorithm (Shortest Path in Weighted Graph)
#include <iostream>
#include <vector>
#include <queue>

using namespace std;

typedef pair<int, int> pii; // {weight, node}

vector<int> dijkstra(int V, vector<vector<pii>>& adj, int src) {
    priority_queue<pii, vector<pii>, greater<pii>> pq;
    vector<int> dist(V, 1e9);

    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue;

        for (auto& [weight, v] : adj[u]) {
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,

  c: `// C Standard: Singly Linked List Reversal in O(N) Time and O(1) Space
#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node* next;
};

struct Node* reverseList(struct Node* head) {
    struct Node *prev = NULL, *curr = head, *next = NULL;
    while (curr != NULL) {
        next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,

  javascript: `// JavaScript (ES2024): Asynchronous Task Queue with Concurrency Limit
class TaskQueue {
  constructor(concurrency = 2) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  push(task) {
    this.queue.push(task);
    this.next();
  }

  async next() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift();
      this.running++;
      try {
        await task();
      } finally {
        this.running--;
        this.next();
      }
    }
  }
}`,

  typescript: `// TypeScript 5.7: Generic Type-Safe Event Emitter Pattern
type Listener<T> = (data: T) => void | Promise<void>;

export class TypedEventEmitter<Events extends Record<string, any>> {
  private listeners = new Map<keyof Events, Set<Listener<any>>>();

  on<E extends keyof Events>(event: E, listener: Listener<Events[E]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)?.delete(listener);
  }

  emit<E extends keyof Events>(event: E, data: Events[E]): void {
    this.listeners.get(event)?.forEach(fn => fn(data));
  }
}`,

  html: `<!-- Modern HTML5 Semantic Document Structure with OpenGraph & Meta -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kedar AI — Personal AI Operating System</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body class="bg-slate-950 text-slate-100">
  <header class="navbar">
    <nav aria-label="Main Navigation">
      <a href="/" class="brand">Kedar AI</a>
    </nav>
  </header>
  <main id="app-root" class="container">
    <h1>Welcome to Kedar AI Studio</h1>
  </main>
</body>
</html>`,

  css: `/* Modern Cyber-Academic Dark Glassmorphism CSS Design Tokens */
:root {
  --primary-accent: #6366f1;
  --cyber-purple: #a855f7;
  --emerald-success: #10b981;
  --bg-deep: #020617;
  --surface-glass: rgba(15, 23, 42, 0.75);
}

.glass-panel {
  background: var(--surface-glass);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-panel:hover {
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateY(-2px);
}`,

  sql: `-- PostgreSQL: Top Performing Queries with Window Functions & Partitions
SELECT 
    r.id,
    r.name,
    r.stars_count,
    r.forks_count,
    RANK() OVER (PARTITION BY r.language ORDER BY r.stars_count DESC) as language_rank,
    AVG(r.stars_count) OVER (PARTITION BY r.language) as avg_lang_stars
FROM repositories r
WHERE r.created_at >= NOW() - INTERVAL '30 days'
ORDER BY r.stars_count DESC
LIMIT 10;`
};

export const CodingView: React.FC = () => {
  const { profile, memories, settings, showToast } = useApp();
  
  const [language, setLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>(defaultCodes.python);
  const [promptInput, setPromptInput] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeActionTab, setActiveActionTab] = useState<'generate' | 'explain' | 'debug' | 'optimize'>('generate');

  const supportedLanguages = [
    { id: 'python', label: 'Python' },
    { id: 'cpp', label: 'C++' },
    { id: 'c', label: 'C' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'html', label: 'HTML' },
    { id: 'css', label: 'CSS' },
    { id: 'sql', label: 'SQL' }
  ];

  useEffect(() => {
    Prism.highlightAll();
  }, [code, language, analysisResult]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(defaultCodes[newLang] || '// Write your code here...');
    setAnalysisResult(null);
  };

  const handleGenerateCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    showToast(`AI generating ${language.toUpperCase()} code...`, 'info');

    try {
      const result = await aiService.processCodeAction(
        'generate',
        language,
        code,
        promptInput,
        { profile, memories, settings }
      );

      const codeMatch = result.match(/```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/);
      if (codeMatch && codeMatch[2]) {
        setCode(codeMatch[2].trim());
      }
      setAnalysisResult(result);
      showToast('Code generated successfully!', 'success');
      setPromptInput('');
    } catch (err: any) {
      showToast(`Generation failed: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCodeAction = async (action: 'explain' | 'debug' | 'optimize') => {
    if (!code.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setActiveActionTab(action);
    showToast(`AI executing ${action.toUpperCase()} on your code...`, 'info');

    try {
      const result = await aiService.processCodeAction(
        action,
        language,
        code,
        promptInput,
        { profile, memories, settings }
      );
      setAnalysisResult(result);
      showToast(`${action.toUpperCase()} completed!`, 'success');
    } catch (err: any) {
      showToast(`Analysis failed: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast('Code copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const extensions: Record<string, string> = {
      python: 'py',
      cpp: 'cpp',
      c: 'c',
      javascript: 'js',
      typescript: 'ts',
      html: 'html',
      css: 'css',
      sql: 'sql'
    };
    const ext = extensions[language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solution.${ext}`;
    a.click();
    showToast(`Downloaded solution.${ext}!`, 'success');
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/70 via-slate-900/90 to-indigo-950/70 border border-blue-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            <Code2 className="w-3.5 h-3.5" />
            <span>AI Code Generation & Optimization IDE</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">Coding Studio</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Real-time code generation, line-by-line explanation, bug detection, and Big-O performance optimization across 8 programming languages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
          <button
            onClick={downloadFile}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Generation Prompt Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">AI Code Generator</span>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Language:</span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500 font-medium"
            >
              {supportedLanguages.map(l => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleGenerateCode} className="flex gap-2">
          <input
            type="text"
            placeholder={`Describe the ${language.toUpperCase()} code you want to build (e.g. Build LRU Cache with O(1) ops, A* Search algorithm, Debounced search hook)...`}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={isAnalyzing || !promptInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAnalyzing ? 'Synthesizing...' : 'Generate Code'}</span>
          </button>
        </form>
      </div>

      {/* Editor & Action Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Interactive Code Editor */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden flex flex-col shadow-xl">
          <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Source Editor ({language})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            rows={18}
            className="w-full p-4 bg-slate-950 font-mono text-xs text-slate-200 outline-none resize-none leading-relaxed border-b border-slate-800"
          />

          {/* Action Buttons Bar */}
          <div className="p-3 bg-slate-950/60 flex flex-wrap items-center gap-2 justify-between">
            <span className="text-[11px] text-slate-500">Run AI Analysis:</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleCodeAction('explain')}
                disabled={isAnalyzing}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1"
              >
                <BookOpenIcon className="w-3.5 h-3.5" />
                <span>Explain Code</span>
              </button>

              <button
                onClick={() => handleCodeAction('debug')}
                disabled={isAnalyzing}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1"
              >
                <Bug className="w-3.5 h-3.5" />
                <span>Debug & Fix</span>
              </button>

              <button
                onClick={() => handleCodeAction('optimize')}
                disabled={isAnalyzing}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Optimize (Big-O)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: AI Output & Analysis */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden flex flex-col shadow-xl">
          <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">AI Analysis & Insights</span>
            </div>
            {analysisResult && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(analysisResult);
                  showToast('AI response copied!', 'success');
                }}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Output</span>
              </button>
            )}
          </div>

          <div className="flex-1 p-5 overflow-y-auto max-h-[500px] text-xs text-slate-200 leading-relaxed">
            {isAnalyzing ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
                <p className="font-semibold text-sm">Processing code through AI engine...</p>
                <p className="text-xs text-slate-500">Calculating Time Complexity, syntax validity, and edge-cases.</p>
              </div>
            ) : analysisResult ? (
              <div 
                className="prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: marked.parse(analysisResult) as string }}
              />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2 text-center p-6">
                <Code2 className="w-10 h-10 text-slate-700" />
                <p className="font-semibold text-sm text-slate-400">Ready to synthesize or analyze code</p>
                <p className="text-xs">Select any action on the left: Generate code, Explain line-by-line, Debug bugs, or Optimize Big-O efficiency.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

function BookOpenIcon(props: any) {
  return <Layers {...props} />;
}
