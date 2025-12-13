import { create } from 'zustand';
import { User, UserRole, MoodLog, SafetyContract, ShareSettings, PatientStatus, ChatMessage } from '../types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  selectedRole: UserRole | null;
  
  currentMood: number;
  moodLogs: MoodLog[];
  
  safetyContract: SafetyContract | null;
  
  shareSettings: ShareSettings;
  
  linkedPatientStatus: PatientStatus | null;
  
  chatHistory: ChatMessage[];
  
  setUser: (user: User | null) => void;
  setSelectedRole: (role: UserRole | null) => void;
  setCurrentMood: (mood: number) => void;
  addMoodLog: (log: MoodLog) => void;
  setSafetyContract: (contract: SafetyContract | null) => void;
  updateShareSettings: (settings: Partial<ShareSettings>) => void;
  setLinkedPatientStatus: (status: PatientStatus | null) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  selectedRole: null,
  
  currentMood: 5,
  moodLogs: [],
  
  safetyContract: null,
  
  shareSettings: {
    shareMoodGraph: true,
    shareJournalEntries: false,
    shareCrisisEvents: true,
    shareSkillUsage: true,
  },
  
  linkedPatientStatus: null,
  
  chatHistory: [],
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setSelectedRole: (role) => set({ selectedRole: role }),
  
  setCurrentMood: (mood) => set({ currentMood: mood }),
  
  addMoodLog: (log) => set((state) => ({ 
    moodLogs: [...state.moodLogs, log] 
  })),
  
  setSafetyContract: (contract) => set({ safetyContract: contract }),
  
  updateShareSettings: (settings) => set((state) => ({
    shareSettings: { ...state.shareSettings, ...settings }
  })),
  
  setLinkedPatientStatus: (status) => set({ linkedPatientStatus: status }),
  
  addChatMessage: (message) => set((state) => ({
    chatHistory: [...state.chatHistory, message]
  })),
  
  clearChatHistory: () => set({ chatHistory: [] }),
  
  logout: () => set({
    user: null,
    isAuthenticated: false,
    selectedRole: null,
    chatHistory: [],
  }),
}));
