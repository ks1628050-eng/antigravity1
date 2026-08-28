import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { 
  NavSection, UserProfile, TaskItem, MemoryItem, LearningRoadmap, 
  BusinessIdea, ContentPost, Conversation, ChatMessage, AISettings 
} from '../types';
import { storageService } from '../services/storageService';
import { backendService } from '../services/backendService';

interface AppContextType {
  currentSection: NavSection;
  setCurrentSection: (section: NavSection) => void;
  profile: UserProfile;
  updateProfile: (profile: UserProfile) => Promise<void>;
  tasks: TaskItem[];
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (task: TaskItem) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  memories: MemoryItem[];
  addMemory: (memory: Omit<MemoryItem, 'id' | 'createdAt'>) => Promise<void>;
  updateMemory: (memory: MemoryItem) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  messages: Record<string, ChatMessage[]>;
  createConversation: (title?: string, category?: Conversation['category']) => string;
  updateConversationTitle: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  addMessage: (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  updateMessageContent: (conversationId: string, messageId: string, content: string) => void;
  roadmaps: LearningRoadmap[];
  addRoadmap: (roadmap: LearningRoadmap) => Promise<void>;
  deleteRoadmap: (id: string) => Promise<void>;
  toggleTopicCompletion: (roadmapId: string, moduleId: string, topicIndex: number) => Promise<void>;
  businessIdeas: BusinessIdea[];
  addBusinessIdea: (idea: BusinessIdea) => Promise<void>;
  deleteBusinessIdea: (id: string) => Promise<void>;
  contentPosts: ContentPost[];
  addContentPost: (post: ContentPost) => Promise<void>;
  deleteContentPost: (id: string) => Promise<void>;
  settings: AISettings;
  updateSettings: (settings: Partial<AISettings>) => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isCloudConfigured: boolean;
  isLoadingData: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSection, setCurrentSection] = useState<NavSection>('dashboard');
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getProfile());
  const [tasks, setTasks] = useState<TaskItem[]>(() => storageService.getTasks());
  const [memories, setMemories] = useState<MemoryItem[]>(() => storageService.getMemories());
  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>(() => storageService.getRoadmaps());
  const [conversations, setConversations] = useState<Conversation[]>(() => storageService.getConversations());
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => storageService.getMessages());
  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    const convs = storageService.getConversations();
    return convs.length > 0 ? convs[0].id : '';
  });
  const [businessIdeas, setBusinessIdeas] = useState<BusinessIdea[]>(() => storageService.getBusinessIdeas());
  const [contentPosts, setContentPosts] = useState<ContentPost[]>(() => storageService.getContentPosts());
  const [settings, setSettings] = useState<AISettings>(() => storageService.getSettings());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Sync dark/light theme
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Hydrate session & Supabase database tables
  useEffect(() => {
    let cancelled = false;

    const hydrateAuthAndData = async () => {
      setIsLoadingData(true);
      try {
        const activeSession = await backendService.getSession();
        if (cancelled) return;
        setSession(activeSession);

        if (activeSession) {
          // Fetch normalized tables in parallel
          const [
            cloudProfile,
            cloudTasks,
            cloudMemories,
            cloudRoadmaps,
            cloudConvs,
            cloudIdeas,
            cloudPosts
          ] = await Promise.all([
            backendService.getProfile(),
            backendService.getTasks(),
            backendService.getMemories(),
            backendService.getRoadmaps(),
            backendService.getConversations(),
            backendService.getBusinessIdeas(),
            backendService.getContentPosts()
          ]);

          if (cancelled) return;
          if (cloudProfile) setProfile(cloudProfile);
          if (cloudTasks && cloudTasks.length > 0) setTasks(cloudTasks);
          if (cloudMemories && cloudMemories.length > 0) setMemories(cloudMemories);
          if (cloudRoadmaps && cloudRoadmaps.length > 0) setRoadmaps(cloudRoadmaps);
          if (cloudConvs && cloudConvs.length > 0) {
            setConversations(cloudConvs);
            setActiveConversationId(cloudConvs[0].id);

            // Fetch messages for active conversation
            const activeMsgs = await backendService.getMessages(cloudConvs[0].id);
            if (activeMsgs && !cancelled) {
              setMessages(prev => ({ ...prev, [cloudConvs[0].id]: activeMsgs }));
            }
          }
          if (cloudIdeas && cloudIdeas.length > 0) setBusinessIdeas(cloudIdeas);
          if (cloudPosts && cloudPosts.length > 0) setContentPosts(cloudPosts);
        }
      } catch (error) {
        console.warn('Supabase table hydration error:', error);
      } finally {
        if (!cancelled) setIsLoadingData(false);
      }
    };

    void hydrateAuthAndData();
    return () => { cancelled = true; };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const signIn = async (email: string, password: string) => {
    const s = await backendService.signIn(email, password);
    setSession(s);
    showToast('Signed in successfully!', 'success');
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const s = await backendService.signUp(email, password, fullName);
    setSession(s);
    showToast('Account created successfully!', 'success');
  };

  const signOut = async () => {
    await backendService.signOut();
    setSession(null);
    showToast('Signed out of Kedar AI', 'info');
  };

  const updateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    storageService.saveProfile(newProfile);
    await backendService.upsertProfile(newProfile);
    showToast('Profile updated and synced!', 'success');
  };

  const addTask = async (taskData: Omit<TaskItem, 'id' | 'createdAt'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    storageService.saveTasks(updated);
    await backendService.saveTask(newTask);
    showToast('Task added to your board!', 'success');
  };

  const updateTask = async (updatedTask: TaskItem) => {
    const updated = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(updated);
    storageService.saveTasks(updated);
    await backendService.saveTask(updatedTask);
    showToast('Task updated!', 'success');
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    storageService.saveTasks(updated);
    await backendService.deleteTask(id);
    showToast('Task removed', 'info');
  };

  const toggleTask = async (id: string) => {
    let targetTask: TaskItem | undefined;
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextState = !t.isCompleted;
        targetTask = {
          ...t,
          isCompleted: nextState,
          status: nextState ? 'completed' : 'todo',
          completedAt: nextState ? new Date().toISOString() : undefined
        };
        return targetTask;
      }
      return t;
    });
    setTasks(updated);
    storageService.saveTasks(updated);
    if (targetTask) {
      await backendService.saveTask(targetTask);
    }
  };

  const addMemory = async (memoryData: Omit<MemoryItem, 'id' | 'createdAt'>) => {
    const newMemory: MemoryItem = {
      ...memoryData,
      id: `mem-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newMemory, ...memories];
    setMemories(updated);
    storageService.saveMemories(updated);
    await backendService.saveMemory(newMemory);
    showToast('Memory saved to AI brain!', 'success');
  };

  const updateMemory = async (updatedMemory: MemoryItem) => {
    const updated = memories.map(m => m.id === updatedMemory.id ? { ...updatedMemory, updatedAt: new Date().toISOString() } : m);
    setMemories(updated);
    storageService.saveMemories(updated);
    await backendService.saveMemory(updatedMemory);
    showToast('Memory updated!', 'success');
  };

  const deleteMemory = async (id: string) => {
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    storageService.saveMemories(updated);
    await backendService.deleteMemory(id);
    showToast('Memory deleted', 'info');
  };

  const createConversation = (title = 'New Conversation', category: Conversation['category'] = 'general'): string => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title,
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedConvs = [newConv, ...conversations];
    setConversations(updatedConvs);
    storageService.saveConversations(updatedConvs);
    
    const updatedMessages = { ...messages, [newConv.id]: [] };
    setMessages(updatedMessages);
    storageService.saveMessages(updatedMessages);
    
    setActiveConversationId(newConv.id);
    void backendService.saveConversation(newConv);
    return newConv.id;
  };

  const updateConversationTitle = async (id: string, title: string) => {
    let targetConv: Conversation | undefined;
    const updated = conversations.map(c => {
      if (c.id === id) {
        targetConv = { ...c, title, updatedAt: new Date().toISOString() };
        return targetConv;
      }
      return c;
    });
    setConversations(updated);
    storageService.saveConversations(updated);
    if (targetConv) {
      await backendService.saveConversation(targetConv);
    }
  };

  const deleteConversation = async (id: string) => {
    const updatedConvs = conversations.filter(c => c.id !== id);
    setConversations(updatedConvs);
    storageService.saveConversations(updatedConvs);

    const updatedMessages = { ...messages };
    delete updatedMessages[id];
    setMessages(updatedMessages);
    storageService.saveMessages(updatedMessages);

    if (activeConversationId === id) {
      setActiveConversationId(updatedConvs.length > 0 ? updatedConvs[0].id : '');
    }
    await backendService.deleteConversation(id);
    showToast('Conversation deleted', 'info');
  };

  const addMessage = (conversationId: string, messageData: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
    const newMsg: ChatMessage = {
      ...messageData,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };

    const convMessages = messages[conversationId] || [];
    const updatedList = [...convMessages, newMsg];
    const updatedMap = { ...messages, [conversationId]: updatedList };

    setMessages(updatedMap);
    storageService.saveMessages(updatedMap);

    const updatedConvs = conversations.map(c => c.id === conversationId ? { ...c, updatedAt: new Date().toISOString() } : c);
    setConversations(updatedConvs);
    storageService.saveConversations(updatedConvs);

    if (!newMsg.isStreaming && newMsg.content) {
      void backendService.saveMessage(newMsg);
    }

    return newMsg;
  };

  const updateMessageContent = (conversationId: string, messageId: string, content: string) => {
    const convMessages = messages[conversationId] || [];
    const updatedList = convMessages.map(m => m.id === messageId ? { ...m, content, isStreaming: false } : m);
    const updatedMap = { ...messages, [conversationId]: updatedList };

    setMessages(updatedMap);
    storageService.saveMessages(updatedMap);

    const targetMsg = updatedList.find(m => m.id === messageId);
    if (targetMsg && content) {
      void backendService.saveMessage(targetMsg);
    }
  };

  const addRoadmap = async (roadmap: LearningRoadmap) => {
    const updated = [roadmap, ...roadmaps];
    setRoadmaps(updated);
    storageService.saveRoadmaps(updated);
    await backendService.saveRoadmap(roadmap);
    showToast('Learning roadmap saved to your curriculum!', 'success');
  };

  const deleteRoadmap = async (id: string) => {
    const updated = roadmaps.filter(r => r.id !== id);
    setRoadmaps(updated);
    storageService.saveRoadmaps(updated);
    await backendService.deleteRoadmap(id);
    showToast('Roadmap removed', 'info');
  };

  const toggleTopicCompletion = async (roadmapId: string, moduleId: string, topicIndex: number) => {
    const updatedRoadmaps = roadmaps.map(r => {
      if (r.id === roadmapId) {
        const updatedModules = r.modules.map(m => {
          if (m.id === moduleId) {
            return { ...m, completed: !m.completed };
          }
          return m;
        });

        let totalModules = updatedModules.length;
        let completedModules = updatedModules.filter(m => m.completed).length;
        const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

        return {
          ...r,
          modules: updatedModules,
          progress
        };
      }
      return r;
    });

    setRoadmaps(updatedRoadmaps);
    storageService.saveRoadmaps(updatedRoadmaps);

    const target = updatedRoadmaps.find(r => r.id === roadmapId);
    if (target) {
      await backendService.saveRoadmap(target);
    }
  };

  const addBusinessIdea = async (idea: BusinessIdea) => {
    const updated = [idea, ...businessIdeas];
    setBusinessIdeas(updated);
    storageService.saveBusinessIdeas(updated);
    await backendService.saveBusinessIdea(idea);
    showToast('Business idea saved to vault!', 'success');
  };

  const deleteBusinessIdea = async (id: string) => {
    const updated = businessIdeas.filter(b => b.id !== id);
    setBusinessIdeas(updated);
    storageService.saveBusinessIdeas(updated);
    await backendService.deleteBusinessIdea(id);
    showToast('Idea removed', 'info');
  };

  const addContentPost = async (post: ContentPost) => {
    const updated = [post, ...contentPosts];
    setContentPosts(updated);
    storageService.saveContentPosts(updated);
    await backendService.saveContentPost(post);
    showToast('Content post saved to studio!', 'success');
  };

  const deleteContentPost = async (id: string) => {
    const updated = contentPosts.filter(p => p.id !== id);
    setContentPosts(updated);
    storageService.saveContentPosts(updated);
    await backendService.deleteContentPost(id);
    showToast('Post removed', 'info');
  };

  const updateSettings = (newSettings: Partial<AISettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    storageService.saveSettings(updated);
    showToast('Settings saved!', 'success');
  };

  return (
    <AppContext.Provider value={{
      currentSection,
      setCurrentSection,
      profile,
      updateProfile,
      tasks,
      addTask,
      updateTask,
      deleteTask,
      toggleTask,
      memories,
      addMemory,
      updateMemory,
      deleteMemory,
      conversations,
      activeConversationId,
      setActiveConversationId,
      messages,
      createConversation,
      updateConversationTitle,
      deleteConversation,
      addMessage,
      updateMessageContent,
      roadmaps,
      addRoadmap,
      deleteRoadmap,
      toggleTopicCompletion,
      businessIdeas,
      addBusinessIdea,
      deleteBusinessIdea,
      contentPosts,
      addContentPost,
      deleteContentPost,
      settings,
      updateSettings,
      toast,
      showToast,
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
      session,
      signIn,
      signUp,
      signOut,
      isCloudConfigured: backendService.isConfigured,
      isLoadingData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
