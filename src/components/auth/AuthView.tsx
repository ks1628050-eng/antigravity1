import React, { useState } from 'react';
import { LogIn, UserPlus, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuthView: React.FC = () => {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'sign-in') await signIn(email, password);
      else await signUp(email, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-7">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold">Kedar AI</h1>
          <p className="text-sm text-slate-400">Sign in to sync your chats, memory, tasks, and learning progress.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Email address" className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm outline-none focus:border-indigo-500" />
          <input required minLength={6} type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm outline-none focus:border-indigo-500" />
          {error && <p className="text-xs text-rose-300">{error}</p>}
          <button disabled={busy} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-semibold text-sm">
            {mode === 'sign-in' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {busy ? 'Working...' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <button onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')} className="w-full text-xs text-indigo-300 hover:text-indigo-200">
          {mode === 'sign-in' ? 'Need an account? Create one' : 'Already registered? Sign in'}
        </button>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-center"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Your workspace is protected by Supabase RLS.</div>
      </div>
    </main>
  );
};
