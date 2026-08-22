import { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  AISettings, BusinessIdea, ContentPost, Conversation, LearningRoadmap,
  MemoryItem, TaskItem, UserProfile, ChatMessage
} from '../types';

export interface WorkspaceData {
  profile: UserProfile;
  tasks: TaskItem[];
  memories: MemoryItem[];
  roadmaps: LearningRoadmap[];
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  businessIdeas: BusinessIdea[];
  contentPosts: ContentPost[];
  settings: AISettings;
}

export const backendService = {
  isConfigured: isSupabaseConfigured,
  getSession: async (): Promise<Session | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
  signIn: async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  signUp: async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  },
  signOut: async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  loadWorkspace: async (): Promise<Partial<WorkspaceData> | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('user_workspaces').select('data').maybeSingle();
    if (error) throw error;
    return (data?.data as Partial<WorkspaceData> | undefined) || null;
  },
  saveWorkspace: async (data: Partial<WorkspaceData>) => {
    if (!supabase) return;
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userData.user) return;
    const { error } = await supabase.from('user_workspaces').upsert({
      user_id: userData.user.id,
      data,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
  },
  invokeAI: async (payload: Record<string, unknown>) => {
    if (!supabase) return null;
    const { data, error } = await supabase.functions.invoke('ai-chat', { body: payload });
    if (error) throw error;
    return data as { text: string };
  },
  createPaymentOrder: async (amount: number, planName: string) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.functions.invoke('payment', { body: { action: 'create-order', amount, planName } });
    if (error) throw error;
    return data as { orderId: string; amount: number; currency: string };
  },
  verifyPayment: async (payload: Record<string, string>) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.functions.invoke('payment', { body: { action: 'verify', ...payload } });
    if (error) throw error;
    return data as { verified: boolean; paymentId: string };
  }
};
