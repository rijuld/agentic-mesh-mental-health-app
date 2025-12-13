import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, MoodLog, SafetyContract, ShareSettings, PatientStatus, ChatMessage } from '../types';
import { databaseService } from '../services/databaseService';

interface ConnectionRequest {
  id: string;
  fromUserId: string;
  fromUserRole: string;
  fromUserName?: string;
  status: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  selectedRole: UserRole | null;
  
  currentMood: number;
  moodLogs: MoodLog[];
  
  safetyContract: SafetyContract | null;
  
  shareSettings: ShareSettings;
  
  linkedPatientStatus: PatientStatus | null;
  linkedAccounts: Array<{ id: string; role: string; name?: string }>;
  connectionRequests: ConnectionRequest[];
  
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
  saveMoodToDatabase: (mood: number, note?: string) => Promise<void>;
  loadLinkedAccounts: () => Promise<void>;
  loadConnectionRequests: () => Promise<void>;
  sendConnectionRequest: (toUserId: string, toUserRole: string) => Promise<boolean>;
  acceptConnectionRequest: (requestId: string, fromUserId: string) => Promise<boolean>;
  rejectConnectionRequest: (requestId: string) => Promise<boolean>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      selectedRole: null,
      connectionRequests: [],
      
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
        chatHistory: [],
        linkedAccounts: [],
        connectionRequests: [],
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
              user: { id: userId, email, name, role, createdAt: new Date().toISOString() },
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

      loadConnectionRequests: async () => {
        const { user } = get();
        if (!user?.id) return;
        
        try {
          const requests = await databaseService.getConnectionRequests(user.id);
          set({ connectionRequests: requests });
        } catch (error) {
          console.error('Error loading connection requests:', error);
        }
      },

      sendConnectionRequest: async (toUserId: string, toUserRole: string) => {
        const { user } = get();
        if (!user?.id) return false;
        
        try {
          const success = await databaseService.sendConnectionRequest(
            user.id,
            user.role,
            toUserId,
            toUserRole
          );
          return success;
        } catch (error) {
          console.error('Error sending connection request:', error);
          return false;
        }
      },

      acceptConnectionRequest: async (requestId: string, fromUserId: string) => {
        const { user } = get();
        if (!user?.id) return false;
        
        try {
          const patientId = user.role === 'patient' ? user.id : fromUserId;
          const therapistId = user.role === 'therapist' ? user.id : fromUserId;
          
          const success = await databaseService.acceptConnectionRequest(requestId, patientId, therapistId);
          if (success) {
            await get().loadLinkedAccounts();
            await get().loadConnectionRequests();
          }
          return success;
        } catch (error) {
          console.error('Error accepting connection request:', error);
          return false;
        }
      },

      rejectConnectionRequest: async (requestId: string) => {
        try {
          const success = await databaseService.rejectConnectionRequest(requestId);
          if (success) {
            await get().loadConnectionRequests();
          }
          return success;
        } catch (error) {
          console.error('Error rejecting connection request:', error);
          return false;
        }
      },

      saveMoodToDatabase: async (mood, note) => {
        const { user, addMoodLog } = get();
        if (!user?.id) return;
        
        const moodLog: MoodLog = {
          id: Date.now().toString(),
          userId: user.id,
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
        linkedAccounts: state.linkedAccounts,
      }),
    }
  )
);
