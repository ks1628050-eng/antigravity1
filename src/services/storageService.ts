import { 
  UserProfile, TaskItem, MemoryItem, LearningRoadmap, 
  BusinessIdea, ContentPost, Conversation, ChatMessage, AISettings 
} from '../types';
import { 
  initialProfile, initialTasks, initialMemories, 
  initialRoadmaps, initialConversations, initialMessages, 
  initialBusinessIdeas, initialSettings 
} from '../data/initialData';

const KEYS = {
  PROFILE: 'kedar_ai_profile_v1',
  TASKS: 'kedar_ai_tasks_v1',
  MEMORIES: 'kedar_ai_memories_v1',
  ROADMAPS: 'kedar_ai_roadmaps_v1',
  CONVERSATIONS: 'kedar_ai_conversations_v1',
  MESSAGES: 'kedar_ai_messages_v1',
  BUSINESS_IDEAS: 'kedar_ai_business_ideas_v1',
  CONTENT_POSTS: 'kedar_ai_content_posts_v1',
  SETTINGS: 'kedar_ai_settings_v1',
};

export const storageService = {
  // Profile
  getProfile: (): UserProfile => {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : initialProfile;
  },
  saveProfile: (profile: UserProfile): void => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  // Tasks
  getTasks: (): TaskItem[] => {
    const data = localStorage.getItem(KEYS.TASKS);
    return data ? JSON.parse(data) : initialTasks;
  },
  saveTasks: (tasks: TaskItem[]): void => {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  },

  // Memories
  getMemories: (): MemoryItem[] => {
    const data = localStorage.getItem(KEYS.MEMORIES);
    return data ? JSON.parse(data) : initialMemories;
  },
  saveMemories: (memories: MemoryItem[]): void => {
    localStorage.setItem(KEYS.MEMORIES, JSON.stringify(memories));
  },

  // Roadmaps
  getRoadmaps: (): LearningRoadmap[] => {
    const data = localStorage.getItem(KEYS.ROADMAPS);
    return data ? JSON.parse(data) : initialRoadmaps;
  },
  saveRoadmaps: (roadmaps: LearningRoadmap[]): void => {
    localStorage.setItem(KEYS.ROADMAPS, JSON.stringify(roadmaps));
  },

  // Conversations
  getConversations: (): Conversation[] => {
    const data = localStorage.getItem(KEYS.CONVERSATIONS);
    return data ? JSON.parse(data) : initialConversations;
  },
  saveConversations: (conversations: Conversation[]): void => {
    localStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(conversations));
  },

  // Messages
  getMessages: (): Record<string, ChatMessage[]> => {
    const data = localStorage.getItem(KEYS.MESSAGES);
    return data ? JSON.parse(data) : initialMessages;
  },
  saveMessages: (messages: Record<string, ChatMessage[]>): void => {
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
  },

  // Business Ideas
  getBusinessIdeas: (): BusinessIdea[] => {
    const data = localStorage.getItem(KEYS.BUSINESS_IDEAS);
    return data ? JSON.parse(data) : initialBusinessIdeas;
  },
  saveBusinessIdeas: (ideas: BusinessIdea[]): void => {
    localStorage.setItem(KEYS.BUSINESS_IDEAS, JSON.stringify(ideas));
  },

  // Content Posts
  getContentPosts: (): ContentPost[] => {
    const data = localStorage.getItem(KEYS.CONTENT_POSTS);
    return data ? JSON.parse(data) : [];
  },
  saveContentPosts: (posts: ContentPost[]): void => {
    localStorage.setItem(KEYS.CONTENT_POSTS, JSON.stringify(posts));
  },

  // Settings
  getSettings: (): AISettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : initialSettings;
  },
  saveSettings: (settings: AISettings): void => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Export / Backup all data
  exportAllData: (): string => {
    const backup = {
      profile: storageService.getProfile(),
      tasks: storageService.getTasks(),
      memories: storageService.getMemories(),
      roadmaps: storageService.getRoadmaps(),
      conversations: storageService.getConversations(),
      messages: storageService.getMessages(),
      businessIdeas: storageService.getBusinessIdeas(),
      contentPosts: storageService.getContentPosts(),
      settings: storageService.getSettings(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(backup, null, 2);
  },

  // Import data
  importAllData: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.profile) storageService.saveProfile(data.profile);
      if (data.tasks) storageService.saveTasks(data.tasks);
      if (data.memories) storageService.saveMemories(data.memories);
      if (data.roadmaps) storageService.saveRoadmaps(data.roadmaps);
      if (data.conversations) storageService.saveConversations(data.conversations);
      if (data.messages) storageService.saveMessages(data.messages);
      if (data.businessIdeas) storageService.saveBusinessIdeas(data.businessIdeas);
      if (data.contentPosts) storageService.saveContentPosts(data.contentPosts);
      if (data.settings) storageService.saveSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },

  // Reset to initial demo data
  resetToDefaults: (): void => {
    localStorage.clear();
    storageService.saveProfile(initialProfile);
    storageService.saveTasks(initialTasks);
    storageService.saveMemories(initialMemories);
    storageService.saveRoadmaps(initialRoadmaps);
    storageService.saveConversations(initialConversations);
    storageService.saveMessages(initialMessages);
    storageService.saveBusinessIdeas(initialBusinessIdeas);
    storageService.saveSettings(initialSettings);
  }
};
