import { UserRole, ChatMessage } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export type AgentType = 
  | 'patient_dbt_coach'
  | 'ally_conflict_resolution'
  | 'therapist_clinical_summary'
  | 'crisis_intervention'
  | 'mentalization_mirror';

interface AgentResponse {
  success: boolean;
  agent_type: AgentType;
  response?: string;
  error?: string;
  details?: string;
}

interface UserContext {
  mood_level?: number;
  distress_level?: number;
  recent_skills_used?: string[];
  crisis_active?: boolean;
  time_since_last_crisis?: string;
}

const ROLE_TO_AGENT: Record<UserRole, AgentType> = {
  patient: 'patient_dbt_coach',
  ally: 'ally_conflict_resolution',
  therapist: 'therapist_clinical_summary',
};

class AgentService {
  private conversationHistory: ChatMessage[] = [];

  async chatWithAgent(
    agentType: AgentType,
    message: string,
    userContext?: UserContext
  ): Promise<AgentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_type: agentType,
          message,
          conversation_history: this.conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          user_context: userContext,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        this.conversationHistory.push(
          { id: Date.now().toString(), role: 'user', content: message, timestamp: new Date().toISOString() },
          { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response, timestamp: new Date().toISOString(), agentType }
        );
      }

      return data;
    } catch (error) {
      return {
        success: false,
        agent_type: agentType,
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async chatWithRole(
    role: UserRole,
    message: string,
    userContext?: UserContext
  ): Promise<AgentResponse> {
    const agentType = ROLE_TO_AGENT[role];
    return this.chatWithAgent(agentType, message, userContext);
  }

  async translateMessage(
    message: string,
    senderContext?: string
  ): Promise<AgentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sender_context: senderContext,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        agent_type: 'ally_conflict_resolution',
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async mentalizeMessage(
    message: string,
    relationshipContext?: string
  ): Promise<AgentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/mentalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          relationship_context: relationshipContext,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        agent_type: 'mentalization_mirror',
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getCrisisSupport(
    situation: string,
    distressLevel: number
  ): Promise<AgentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/crisis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          situation,
          distress_level: distressLevel,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        agent_type: 'crisis_intervention',
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getClinicalSummary(
    patientId: string,
    timePeriod: string = 'past_week'
  ): Promise<AgentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/clinical-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: patientId,
          time_period: timePeriod,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        agent_type: 'therapist_clinical_summary',
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }
}

export const agentService = new AgentService();
