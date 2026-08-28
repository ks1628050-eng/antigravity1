import { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  AISettings, BusinessIdea, ContentPost, Conversation, LearningRoadmap,
  MemoryItem, TaskItem, UserProfile, ChatMessage, LearningItem
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

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  getSession: async (): Promise<Session | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (e) {
      console.warn('Could not get session:', e);
      return null;
    }
  },

  signIn: async (email: string, password: string): Promise<Session | null> => {
    if (!supabase) throw new Error('Supabase is not configured. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
  },

  signUp: async (email: string, password: string, fullName?: string): Promise<Session | null> => {
    if (!supabase) throw new Error('Supabase is not configured. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || email.split('@')[0] }
      }
    });
    if (error) throw error;
    return data.session;
  },

  signOut: async (): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // ==========================================
  // PROFILE CRUD
  // ==========================================
  getProfile: async (): Promise<UserProfile | null> => {
    if (!supabase) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      return {
        id: data.id,
        name: data.full_name || '',
        email: data.email || user.email || '',
        education: data.education || '',
        branch: data.branch || '',
        college: data.college || '',
        currentSemester: data.current_semester || '',
        targetRole: data.target_role || '',
        skills: Array.isArray(data.skills) ? data.skills : [],
        interests: Array.isArray(data.interests) ? data.interests : [],
        currentProjects: Array.isArray(data.current_projects) ? data.current_projects : [],
        preferredLearningStyle: data.preferred_learning_style || 'Practical / Project-based',
        longTermGoals: Array.isArray(data.long_term_goals) ? data.long_term_goals : [],
        bio: data.bio || '',
        userTier: data.user_tier || 'free',
        referralCode: data.referral_code || `KEDAR-${user.id.slice(0, 6).toUpperCase()}`,
        importantDeadlines: []
      };
    } catch (err) {
      console.warn('Error fetching profile from Supabase:', err);
      return null;
    }
  },

  upsertProfile: async (profile: UserProfile): Promise<void> => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: profile.name,
        email: profile.email || user.email || '',
        education: profile.education,
        branch: profile.branch,
        college: profile.college,
        current_semester: profile.currentSemester,
        target_role: profile.targetRole,
        skills: profile.skills,
        interests: profile.interests,
        current_projects: profile.currentProjects,
        preferred_learning_style: profile.preferredLearningStyle,
        long_term_goals: profile.longTermGoals,
        bio: profile.bio,
        user_tier: profile.userTier,
        referral_code: profile.referralCode,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
    } catch (err) {
      console.warn('Error updating profile in Supabase:', err);
    }
  },

  // ==========================================
  // CONVERSATIONS & MESSAGES CRUD
  // ==========================================
  getConversations: async (): Promise<Conversation[] | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        title: row.title,
        category: row.category || 'general',
        isPinned: row.is_pinned || false,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (err) {
      console.warn('Error fetching conversations:', err);
      return null;
    }
  },

  saveConversation: async (conv: Conversation): Promise<void> => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('conversations').upsert({
        id: conv.id.includes('-') && conv.id.length === 36 ? conv.id : undefined,
        user_id: user.id,
        title: conv.title,
        category: conv.category,
        is_pinned: conv.isPinned || false,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error saving conversation:', err);
    }
  },

  deleteConversation: async (id: string): Promise<void> => {
    if (!supabase) return;
    try {
      await supabase.from('conversations').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting conversation:', err);
    }
  },

  getMessages: async (conversationId: string): Promise<ChatMessage[] | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        conversationId: row.conversation_id,
        role: row.role as 'user' | 'assistant' | 'system',
        content: row.content,
        timestamp: row.created_at
      }));
    } catch (err) {
      console.warn('Error fetching messages:', err);
      return null;
    }
  },

  saveMessage: async (msg: ChatMessage): Promise<void> => {
    if (!supabase) return;
    try {
      await supabase.from('messages').upsert({
        conversation_id: msg.conversationId,
        role: msg.role,
        content: msg.content,
        created_at: msg.timestamp || new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error saving message:', err);
    }
  },

  // ==========================================
  // MEMORIES CRUD
  // ==========================================
  getMemories: async (): Promise<MemoryItem[] | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        content: row.content,
        category: row.category,
        importance: row.importance || 'medium',
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (err) {
      console.warn('Error fetching memories:', err);
      return null;
    }
  },

  saveMemory: async (mem: MemoryItem): Promise<void> => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('memories').upsert({
        id: mem.id.includes('-') && mem.id.length === 36 ? mem.id : undefined,
        user_id: user.id,
        content: mem.content,
        category: mem.category,
        importance: mem.importance || 'medium',
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error saving memory:', err);
    }
  },

  deleteMemory: async (id: string): Promise<void> => {
    if (!supabase) return;
    try {
      await supabase.from('memories').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting memory:', err);
    }
  },

  // ==========================================
  // TASKS CRUD
  // ==========================================
  getTasks: async (): Promise<TaskItem[] | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        description: row.description || '',
        priority: row.priority || 'medium',
        status: row.status || (row.is_completed ? 'completed' : 'todo'),
        isCompleted: row.is_completed || row.status === 'completed',
        deadline: row.deadline || '',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        completedAt: row.completed_at
      }));
    } catch (err) {
      console.warn('Error fetching tasks:', err);
      return null;
    }
  },

  saveTask: async (task: TaskItem): Promise<void> => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('tasks').upsert({
        id: task.id.includes('-') && task.id.length === 36 ? task.id : undefined,
        user_id: user.id,
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.isCompleted ? 'completed' : 'todo',
        is_completed: task.isCompleted,
        deadline: task.deadline || '',
        completed_at: task.completedAt,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error saving task:', err);
    }
  },

  deleteTask: async (id: string): Promise<void> => {
    if (!supabase) return;
    try {
      await supabase.from('tasks').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting task:', err);
    }
  },

  // ==========================================
  // LEARNING ROADMAPS & ITEMS CRUD
  // ==========================================
  getRoadmaps: async (): Promise<LearningRoadmap[] | null> => {
    if (!supabase) return null;
    try {
      const { data: roadmapsData, error: roadmapsError } = await supabase
        .from('learning_roadmaps')
        .select('*')
        .order('created_at', { ascending: false });

      if (roadmapsError) throw roadmapsError;
      if (!roadmapsData) return [];

      const roadmapIds = roadmapsData.map(r => r.id);
      let itemsData: any[] = [];
      if (roadmapIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('learning_items')
          .select('*')
          .in('roadmap_id', roadmapIds)
          .order('position', { ascending: true });

        if (!itemsError && items) itemsData = items;
      }

      return roadmapsData.map(row => {
        const roadItems = itemsData.filter(i => i.roadmap_id === row.id);
        const modules = roadItems.length > 0
          ? [{ id: `mod-${row.id}`, title: 'Curriculum Topics', topics: roadItems.map(i => i.title), completed: roadItems.every(i => i.completed) }]
          : [];

        const totalItems = roadItems.length;
        const completedItems = roadItems.filter(i => i.completed).length;
        const calcProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : (row.progress || 0);

        return {
          id: row.id,
          userId: row.user_id,
          title: row.title,
          description: row.description || '',
          icon: row.icon || 'GraduationCap',
          estimatedWeeks: row.estimated_weeks || 4,
          level: row.level || 'Beginner',
          progress: calcProgress,
          modules,
          items: roadItems.map(i => ({
            id: i.id,
            roadmapId: i.roadmap_id,
            title: i.title,
            description: i.description || '',
            completed: i.completed,
            position: i.position
          })),
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      });
    } catch (err) {
      console.warn('Error fetching learning roadmaps:', err);
      return null;
    }
  },

  saveRoadmap: async (roadmap: LearningRoadmap): Promise<string | null> => {
    if (!supabase) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase.from('learning_roadmaps').upsert({
        user_id: user.id,
        title: roadmap.title,
        description: roadmap.description,
        icon: roadmap.icon || 'GraduationCap',
        estimated_weeks: roadmap.estimatedWeeks || 4,
        level: roadmap.level || 'Beginner',
        progress: roadmap.progress || 0,
        updated_at: new Date().toISOString()
      }).select('id').single();

      if (error) throw error;
      const roadmapId = data.id;

      // Save learning items if present
      if (roadmap.items && roadmap.items.length > 0) {
        const itemsToInsert = roadmap.items.map((item, idx) => ({
          roadmap_id: roadmapId,
          title: item.title,
          description: item.description || '',
          completed: item.completed || false,
          position: item.position !== undefined ? item.position : idx
        }));
        await supabase.from('learning_items').upsert(itemsToInsert);
      }

      return roadmapId;
    } catch (err) {
      console.warn('Error saving roadmap:', err);
      return null;
    }
  },

  toggleLearningItem: async (itemId: string, completed: boolean): Promise<void> => {
    if (!supabase) return;
    try {
      await supabase.from('learning_items').update({ completed }).eq('id', itemId);
    } catch (err) {
      console.warn('Error updating learning item:', err);
    }
  },

  deleteRoadmap: async (id: string): Promise<void> => {
    if (!supabase) return;
    try {
      await supabase.from('learning_roadmaps').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting roadmap:', err);
    }
  },

  // ==========================================
  // BUSINESS IDEAS & CONTENT POSTS CRUD
  // ==========================================
  getBusinessIdeas: async (): Promise<BusinessIdea[] | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('business_ideas')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        tagline: row.tagline || '',
        problem: row.problem || '',
        solution: row.solution || '',
        targetAudience: row.target_audience || '',
        techStack: Array.isArray(row.tech_stack) ? row.tech_stack : [],
        monetization: Array.isArray(row.monetization) ? row.monetization : [],
        mvpPlan: Array.isArray(row.mvp_plan) ? row.mvp_plan : [],
        goToAction: [],
        createdAt: row.created_at
      }));
    } catch (err) {
      return null;
    }
  },

  saveBusinessIdea: async (idea: BusinessIdea): Promise<void> => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('business_ideas').upsert({
        user_id: user.id,
        title: idea.title,
        tagline: idea.tagline,
        problem: idea.problem,
        solution: idea.solution,
        target_audience: idea.targetAudience,
        tech_stack: idea.techStack,
        monetization: idea.monetization,
        mvp_plan: idea.mvpPlan
      });
    } catch (err) {
      console.warn('Error saving business idea:', err);
    }
  },

  deleteBusinessIdea: async (id: string): Promise<void> => {
    if (!supabase) return;
    try {
      await supabase.from('business_ideas').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting business idea:', err);
    }
  },

  getContentPosts: async (): Promise<ContentPost[] | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        platform: row.platform as any,
        topic: row.topic,
        tone: row.tone as any,
        generatedContent: row.generated_content,
        hashtags: Array.isArray(row.hashtags) ? row.hashtags : [],
        createdAt: row.created_at
      }));
    } catch (err) {
      return null;
    }
  },

  saveContentPost: async (post: ContentPost): Promise<void> => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('content_posts').upsert({
        user_id: user.id,
        platform: post.platform,
        topic: post.topic,
        tone: post.tone,
        generated_content: post.generatedContent,
        hashtags: post.hashtags
      });
    } catch (err) {
      console.warn('Error saving content post:', err);
    }
  },

  deleteContentPost: async (id: string): Promise<void> => {
    if (!supabase) return;
    try {
      await supabase.from('content_posts').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting content post:', err);
    }
  },

  // ==========================================
  // EDGE FUNCTIONS & PAYMENTS
  // ==========================================
  invokeAI: async (payload: Record<string, unknown>): Promise<{ text: string } | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', { body: payload });
      if (error) throw error;
      return data as { text: string };
    } catch (err) {
      console.warn('Supabase invokeAI error:', err);
      return null;
    }
  },

  createPaymentOrder: async (amount: number, planName: string): Promise<{ orderId: string; amount: number; currency: string }> => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.functions.invoke('payment', { body: { action: 'create-order', amount, planName } });
    if (error) throw error;
    return data as { orderId: string; amount: number; currency: string };
  },

  verifyPayment: async (payload: Record<string, string>): Promise<{ verified: boolean; paymentId: string }> => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.functions.invoke('payment', { body: { action: 'verify', ...payload } });
    if (error) throw error;
    return data as { verified: boolean; paymentId: string };
  }
};
