import React, { useState } from 'react';
import { LogIn, UserPlus, ShieldCheck, Sparkles, Lock, Mail, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuthView: React.FC = () => {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'sign-in') {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 selection:bg-indigo-600 selection:text-white">
      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-7 backdrop-blur-xl animate-scaleUp">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Kedar AI</h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Personal AI Operating System for Students and Developers. Sign in to synchronize your persistent memories, tasks, and roadmaps.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'sign-up' && (
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                required
                type="text"
                value={fullName}
                onChange={event => setFullName(event.target.value)}
                placeholder="Full Name (e.g. Kedar Swami)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              required
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Password (min 6 characters)"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-semibold text-xs text-white shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            {mode === 'sign-in' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{busy ? 'Verifying session...' : mode === 'sign-in' ? 'Sign In to Workspace' : 'Create Account'}</span>
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
            setError('');
          }}
          className="w-full text-xs text-indigo-300 hover:text-indigo-200 text-center font-medium transition-colors"
        >
          {mode === 'sign-in' ? "Don't have an account? Create one" : 'Already registered? Sign In'}
        </button>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-center pt-2 border-t border-slate-800/60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Protected by Supabase Row Level Security (RLS)</span>
        </div>
      </div>
    </main>
  );
};
