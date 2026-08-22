import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  NavSection, UserProfile, TaskItem, MemoryItem, LearningRoadmap, 
  BusinessIdea, ContentPost, Conversation, ChatMessage, AISettings 
} from '../types';
import { storageService } from '../services/storageService';

interface AppContextType {
  currentSection: NavSection;
  setCurrentSection: (section: NavSection) => void;
  profile: UserProfile;
  updateProfile: (profile: UserProfile) => void;
  tasks: TaskItem[];
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  updateTask: (task: TaskItem) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  memories: MemoryItem[];
  addMemory: (memory: Omit<MemoryItem, 'id' | 'createdAt'>) => void;
  updateMemory: (memory: MemoryItem) => void;
  deleteMemory: (id: string) => void;
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  messages: Record<string, ChatMessage[]>;
  createConversation: (title?: string, category?: Conversation['category']) => string;
  updateConversationTitle: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  updateMessageContent: (conversationId: string, messageId: string, content: string) => void;
  roadmaps: LearningRoadmap[];
  toggleTopicCompletion: (roadmapId: string, moduleId: string, topicIndex: number) => void;
  businessIdeas: BusinessIdea[];
  addBusinessIdea: (idea: BusinessIdea) => void;
  deleteBusinessIdea: (id: string) => void;
  contentPosts: ContentPost[];
  addContentPost: (post: ContentPost) => void;
  deleteContentPost: (id: string) => void;
  settings: AISettings;
  updateSettings: (settings: Partial<AISettings>) => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
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

  // Sync theme
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    storageService.saveProfile(newProfile);
    showToast('Profile updated successfully!', 'success');
  };

  const addTask = (taskData: Omit<TaskItem, 'id' | 'createdAt'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    storageService.saveTasks(updated);
    showToast('Task added to your board!', 'success');
  };

  const updateTask = (updatedTask: TaskItem) => {
    const updated = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(updated);
    storageService.saveTasks(updated);
    showToast('Task updated!', 'success');
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    storageService.saveTasks(updated);
    showToast('Task removed', 'info');
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextState = !t.isCompleted;
        return {
          ...t,
          isCompleted: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined
        };
      }
      return t;
    });
    setTasks(updated);
    storageService.saveTasks(updated);
  };

  const addMemory = (memoryData: Omit<MemoryItem, 'id' | 'createdAt'>) => {
    const newMemory: MemoryItem = {
      ...memoryData,
      id: `mem-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newMemory, ...memories];
    setMemories(updated);
    storageService.saveMemories(updated);
    showToast('Memory saved to AI brain!', 'success');
  };

  const updateMemory = (updatedMemory: MemoryItem) => {
    const updated = memories.map(m => m.id === updatedMemory.id ? { ...updatedMemory, updatedAt: new Date().toISOString() } : m);
    setMemories(updated);
    storageService.saveMemories(updated);
    showToast('Memory updated!', 'success');
  };

  const deleteMemory = (id: string) => {
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    storageService.saveMemories(updated);
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
    
    // Initialize empty message array
    const updatedMessages = { ...messages, [newConv.id]: [] };
    setMessages(updatedMessages);
    storageService.saveMessages(updatedMessages);
    
    setActiveConversationId(newConv.id);
    return newConv.id;
  };

  const updateConversationTitle = (id: string, title: string) => {
    const updated = conversations.map(c => c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c);
    setConversations(updated);
    storageService.saveConversations(updated);
  };

  const deleteConversation = (id: string) => {
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

    // Update conversation timestamp
    const updatedConvs = conversations.map(c => c.id === conversationId ? { ...c, updatedAt: new Date().toISOString() } : c);
    setConversations(updatedConvs);
    storageService.saveConversations(updatedConvs);

    return newMsg;
  };

  const updateMessageContent = (conversationId: string, messageId: string, content: string) => {
    const convMessages = messages[conversationId] || [];
    const updatedList = convMessages.map(m => m.id === messageId ? { ...m, content } : m);
    const updatedMap = { ...messages, [conversationId]: updatedList };

    setMessages(updatedMap);
    storageService.saveMessages(updatedMap);
  };

  const toggleTopicCompletion = (roadmapId: string, moduleId: string, topicIndex: number) => {
    const updatedRoadmaps = roadmaps.map(r => {
      if (r.id === roadmapId) {
        const updatedModules = r.modules.map(m => {
          if (m.id === moduleId) {
            return m;
          }
          return m;
        });

        // Recalculate progress
        let totalTopics = 0;
        let completedTopics = 0;
        updatedModules.forEach(m => {
          totalTopics += m.topics.length;
          if (m.completed) completedTopics += m.topics.length;
        });

        return {
          ...r,
          modules: updatedModules,
          progress: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : r.progress
        };
      }
      return r;
    });

    setRoadmaps(updatedRoadmaps);
    storageService.saveRoadmaps(updatedRoadmaps);
  };

  const addBusinessIdea = (idea: BusinessIdea) => {
    const updated = [idea, ...businessIdeas];
    setBusinessIdeas(updated);
    storageService.saveBusinessIdeas(updated);
    showToast('Business idea saved to vault!', 'success');
  };

  const deleteBusinessIdea = (id: string) => {
    const updated = businessIdeas.filter(b => b.id !== id);
    setBusinessIdeas(updated);
    storageService.saveBusinessIdeas(updated);
    showToast('Idea removed', 'info');
  };

  const addContentPost = (post: ContentPost) => {
    const updated = [post, ...contentPosts];
    setContentPosts(updated);
    storageService.saveContentPosts(updated);
    showToast('Content post saved to studio!', 'success');
  };

  const deleteContentPost = (id: string) => {
    const updated = contentPosts.filter(p => p.id !== id);
    setContentPosts(updated);
    storageService.saveContentPosts(updated);
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
      setIsMobileSidebarOpen
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
