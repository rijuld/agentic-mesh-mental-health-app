export type UserRole = 'patient' | 'ally' | 'therapist';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  bloomCode?: string;
  linkedPatientId?: string;
  createdAt?: string;
}

export interface MoodLog {
  id: string;
  userId: string;
  level: number;
  timestamp: string;
  note?: string;
}

export interface CrisisEvent {
  id: string;
  userId: string;
  distressLevel: number;
  intervention: string;
  successful: boolean;
  timestamp: string;
}

export interface SafetyContract {
  id: string;
  patientId: string;
  allyId?: string;
  therapistId?: string;
  terms: ContractTerm[];
  signedByPatient: boolean;
  signedByAlly: boolean;
  signedByTherapist: boolean;
  lastUpdated: string;
}

export interface ContractTerm {
  id: string;
  condition: string;
  action: string;
  responsibleParty: UserRole;
}

export interface DBTSkill {
  id: string;
  name: string;
  category: 'distress_tolerance' | 'emotion_regulation' | 'interpersonal_effectiveness' | 'mindfulness';
  description: string;
  audioGuideUrl?: string;
  steps: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agentType?: string;
}

export interface PatientStatus {
  level: 'green' | 'yellow' | 'red';
  label: string;
  lastUpdated: string;
  moodTrend: number[];
}

export interface ShareSettings {
  shareMoodGraph: boolean;
  shareJournalEntries: boolean;
  shareCrisisEvents: boolean;
  shareSkillUsage: boolean;
}
