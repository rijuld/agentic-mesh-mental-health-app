import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, MoodLog, SafetyContract, ShareSettings, PatientStatus, ChatMessage } from '../types';
import { databaseService } from '../services/databaseService';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  selectedRole: UserRole | null;
  anchorCode: string | null;
  
  currentMood: number;
  moodLogs: MoodLog[];
  
  safetyContract: SafetyContract | null;
  
  shareSettings: ShareSettings;
  
  linkedPatientStatus: PatientStatus | null;
  linkedAccounts: Array<{ id: string; role: string }>;
  
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
  
  registerUser: (email: string, name: string, role: UserRole) => Promise<boolean>;
  loginUser: (email: string) => Promise<boolean>;
  generateAnchorCode: () => Promise<string | null>;
  linkWithAnchorCode: (code: string) => Promise<boolean>;
  saveMoodToDatabase: (mood: number, note?: string) => Promise<void>;
  loadLinkedAccounts: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      selectedRole: null,
      anchorCode: null,
      
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
      linkedAccounts: [],
      
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
        anchorCode: null,
        chatHistory: [],
        linkedAccounts: [],
      }),

      registerUser: async (email, name, role) => {
        try {
          const userId = await databaseService.createUser({
            email,
            name,
            role,
          });
          
          if (userId) {
            set({
              user: { id: userId, email, name, role },
              isAuthenticated: true,
              selectedRole: role,
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Registration error:', error);
          return false;
        }
      },

      loginUser: async (email) => {
        try {
          const user = await databaseService.getUserByEmail(email);
          if (user) {
            set({
              user,
              isAuthenticated: true,
              selectedRole: user.role,
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      generateAnchorCode: async () => {
        const { user } = get();
        if (!user?.id) return null;
        
        try {
          const code = await databaseService.generateAnchorCode(user.id);
          set({ anchorCode: code });
          return code;
        } catch (error) {
          console.error('Error generating anchor code:', error);
          return null;
        }
      },

      linkWithAnchorCode: async (code) => {
        const { user } = get();
        if (!user?.id || user.role === 'patient') return false;
        
        try {
          const result = await databaseService.linkAccountWithCode(
            code,
            user.id,
            user.role as 'ally' | 'therapist'
          );
          
          if (result.success) {
            await get().loadLinkedAccounts();
          }
          return result.success;
        } catch (error) {
          console.error('Error linking with anchor code:', error);
          return false;
        }
      },

      saveMoodToDatabase: async (mood, note) => {
        const { user, addMoodLog } = get();
        if (!user?.id) return;
        
        const moodLog: MoodLog = {
          id: Date.now().toString(),
          level: mood,
          timestamp: new Date().toISOString(),
          note,
        };
        
        addMoodLog(moodLog);
        
        try {
          await databaseService.saveMoodLog({
            userId: user.id,
            level: mood,
            timestamp: new Date().toISOString(),
            note,
          });
        } catch (error) {
          console.error('Error saving mood to database:', error);
        }
      },

      loadLinkedAccounts: async () => {
        const { user } = get();
        if (!user?.id) return;
        
        try {
          const accounts = await databaseService.getLinkedAccounts(user.id, user.role);
          set({ linkedAccounts: accounts });
        } catch (error) {
          console.error('Error loading linked accounts:', error);
        }
      },
    }),
    {
      name: 'bpd-recovery-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        selectedRole: state.selectedRole,
        shareSettings: state.shareSettings,
        moodLogs: state.moodLogs,
      }),
    }
  )
);
