import React, { useState, useEffect } from 'react';
import { 
  Code2, Play, Bug, Sparkles, Copy, Check, Download, 
  RefreshCw, Terminal, Layers, FileCode, CheckCircle2
} from 'lucide-react';
import Prism from 'prismjs';
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
        self.cache = {}  # map key -> Node
        self.head, self.tail = Node(0, 0), Node(0, 0)
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node: Node):
        prev, nxt = node.prev, node.next
        prev.next, nxt.prev = nxt, prev

    def _insert(self, node: Node):
        nxt = self.head.next
        self.head.next = node
        node.prev, node.next = self.head, nxt
        nxt.prev = node

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
            del self.cache[lru.key]`,
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
  react: `// React 19: Debounced Async Search with useActionState
import React, { useState, useTransition } from 'react';

export function SearchUsers() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    startTransition(async () => {
      if (!val.trim()) {
        setResults([]);
        return;
      }
      // Simulated API Call
      const res = ['Kedar Swami', 'Alex Vance', 'Elena Rostova'].filter(u => 
        u.toLowerCase().includes(val.toLowerCase())
      );
      setResults(res);
    });
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search engineering team..."
        className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-sm"
      />
      {isPending && <p className="text-xs text-indigo-400 mt-2">Filtering...</p>}
      <ul className="mt-3 space-y-1">
        {results.map((r, i) => (
          <li key={i} className="p-2 rounded bg-slate-800 text-sm">{r}</li>
        ))}
      </ul>
    </div>
  );
}`,
  sql: `-- PostgreSQL: Top 5 Highest Performing Repositories with Window Functions
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
LIMIT 5;`
};

export const CodingView: React.FC = () => {
  const { profile, memories, settings, showToast } = useApp();
  
  const [language, setLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>(defaultCodes.python);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code, language, analysisResult]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(defaultCodes[newLang] || '// Write your code here...');
    setAnalysisResult(null);
  };

  const handleAnalyze = async (action: 'explain' | 'debug' | 'optimize' | 'complexity') => {
    if (!code.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    showToast(`AI is analyzing code (${action})...`, 'info');

    const prompts = {
      explain: `Explain this ${language} code line by line with its purpose and logic: \n\n\`\`\`${language}\n${code}\n\`\`\``,
      debug: `Analyze this ${language} code for bugs, edge case failures, memory leaks, and fix them: \n\n\`\`\`${language}\n${code}\n\`\`\``,
      optimize: `Optimize this ${language} code for maximum performance and cleanest syntax: \n\n\`\`\`${language}\n${code}\n\`\`\``,
      complexity: `Calculate the exact Time Complexity and Space Complexity (Big-O notation) of this ${language} code with mathematical proof: \n\n\`\`\`${language}\n${code}\n\`\`\``
    };

    try {
      const result = await aiService.generateChatResponse(
        prompts[action],
        [],
        { profile, memories, settings }
      );
      setAnalysisResult(result);
      showToast('Analysis completed!', 'success');
    } catch (err) {
      showToast('Failed to analyze code', 'error');
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
      react: 'tsx',
      sql: 'sql',
      javascript: 'js',
      typescript: 'ts'
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
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-indigo-950/70 border border-cyan-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
            <Code2 className="w-3.5 h-3.5" />
            <span>Developer IDE & Complexity Workbench</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">Coding Studio</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Write, debug, and optimize multi-language algorithms with instant Big-O complexity proofs and line-by-line breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:border-cyan-500 outline-none"
          >
            <option value="python">Python 3.12</option>
            <option value="cpp">C++ 20</option>
            <option value="react">React / TypeScript</option>
            <option value="sql">PostgreSQL</option>
          </select>
        </div>
      </div>

      {/* Editor & Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Code Editor (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                  editor.{language === 'cpp' ? 'cpp' : language === 'python' ? 'py' : language === 'sql' ? 'sql' : 'tsx'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-medium text-slate-300 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={downloadFile}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-medium text-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code Textarea with syntax feel */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={16}
              spellCheck={false}
              className="w-full p-4 rounded-xl bg-slate-950 font-mono text-xs text-cyan-200 border border-slate-800/80 focus:border-cyan-500 outline-none resize-none leading-relaxed selection:bg-cyan-900"
            />

            {/* AI Action Toolset */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <button
                onClick={() => handleAnalyze('explain')}
                disabled={isAnalyzing}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Explain Code</span>
              </button>

              <button
                onClick={() => handleAnalyze('debug')}
                disabled={isAnalyzing}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Bug className="w-3.5 h-3.5 text-rose-400" />
                <span>Debug & Fix</span>
              </button>

              <button
                onClick={() => handleAnalyze('complexity')}
                disabled={isAnalyzing}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Big-O Calc</span>
              </button>

              <button
                onClick={() => handleAnalyze('optimize')}
                disabled={isAnalyzing}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-md shadow-indigo-600/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Optimize</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: AI Output / Complexity Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl min-h-[460px] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>AI Engineering Insights</span>
              </h3>
              {isAnalyzing && (
                <span className="text-xs font-mono text-cyan-400 animate-pulse">Computing...</span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto max-h-[500px] pr-2">
              {analysisResult ? (
                <div 
                  className="markdown-content text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800/80"
                  dangerouslySetInnerHTML={{ __html: Prism.highlight(analysisResult, Prism.languages.javascript, 'javascript') }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                  <Terminal className="w-10 h-10 text-slate-700" />
                  <p className="text-xs">
                    Click <strong className="text-slate-400">Explain Code</strong>, <strong className="text-slate-400">Debug</strong>, or <strong className="text-slate-400">Big-O Calc</strong> to analyze your algorithm.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
