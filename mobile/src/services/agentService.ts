import { UserRole, ChatMessage } from '../types';

// DigitalOcean Gradient AI Agent Endpoints
const AGENT_ENDPOINTS = {
  translator: 'https://tw5vdfz2eujvx64lazljnghx.agents.do-ai.run',
  mentalization: 'https://ttyh5sguidqqq3ttoeuhlall.agents.do-ai.run',
  fpBuffer: 'https://gc3n4w4xfrh6o7obid2vannh.agents.do-ai.run',
  validation: 'https://zt6nnlzy76kb4zjosupviqom.agents.do-ai.run',
  router: 'https://jcjq4yrw6y2ywsllgap457rd.agents.do-ai.run',
};

export type AgentType = 
  | 'translator'
  | 'mentalization'
  | 'fp_buffer'
  | 'validation'
  | 'router';

interface AgentResponse {
  success: boolean;
  agent_type: AgentType;
  response?: string;
  error?: string;
  details?: string;
}

interface DOAgentResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: string;
}

const ROLE_TO_AGENT: Record<UserRole, AgentType> = {
  patient: 'validation',
  ally: 'translator',
  therapist: 'router',
};

const AGENT_TYPE_TO_ENDPOINT: Record<AgentType, string> = {
  translator: AGENT_ENDPOINTS.translator,
  mentalization: AGENT_ENDPOINTS.mentalization,
  fp_buffer: AGENT_ENDPOINTS.fpBuffer,
  validation: AGENT_ENDPOINTS.validation,
  router: AGENT_ENDPOINTS.router,
};

class AgentService {
  private conversationHistory: ChatMessage[] = [];

  private async callDOAgent(
    endpoint: string,
    message: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<DOAgentResponse> {
    const messages = [
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    const response = await fetch(`${endpoint}/api/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        stream: false,
        include_retrieval_info: false,
      }),
    });

    return await response.json();
  }

  async chatWithAgent(
    agentType: AgentType,
    message: string
  ): Promise<AgentResponse> {
    try {
      const endpoint = AGENT_TYPE_TO_ENDPOINT[agentType];
      const history = this.conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const data = await this.callDOAgent(endpoint, message, history);
      
      const responseContent = data.choices?.[0]?.message?.content;
      
      if (responseContent) {
        this.conversationHistory.push(
          { id: Date.now().toString(), role: 'user', content: message, timestamp: new Date().toISOString() },
          { id: (Date.now() + 1).toString(), role: 'assistant', content: responseContent, timestamp: new Date().toISOString(), agentType }
        );

        return {
          success: true,
          agent_type: agentType,
          response: responseContent,
        };
      }

      return {
        success: false,
        agent_type: agentType,
        error: 'No response from agent',
        details: data.error,
      };
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
    message: string
  ): Promise<AgentResponse> {
    const agentType = ROLE_TO_AGENT[role];
    return this.chatWithAgent(agentType, message);
  }

  async translateMessage(
    message: string,
    senderContext?: string
  ): Promise<AgentResponse> {
    const fullMessage = senderContext 
      ? `Context: ${senderContext}\n\nMessage to translate: ${message}`
      : message;
    
    return this.chatWithAgent('translator', fullMessage);
  }

  async mentalizeMessage(
    message: string,
    relationshipContext?: string
  ): Promise<AgentResponse> {
    const fullMessage = relationshipContext
      ? `Relationship context: ${relationshipContext}\n\nMessage to analyze: ${message}`
      : message;
    
    return this.chatWithAgent('mentalization', fullMessage);
  }

  async getFPBufferSupport(
    situation: string
  ): Promise<AgentResponse> {
    return this.chatWithAgent('fp_buffer', situation);
  }

  async getValidation(
    message: string
  ): Promise<AgentResponse> {
    return this.chatWithAgent('validation', message);
  }

  async routeMessage(
    message: string
  ): Promise<AgentResponse> {
    return this.chatWithAgent('router', message);
  }

  async getClinicalSummary(
    patientId: string,
    timePeriod: string = 'past_week'
  ): Promise<AgentResponse> {
    const message = `Generate a clinical summary for patient ${patientId} for the ${timePeriod}.`;
    return this.chatWithAgent('router', message);
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }
}

export const agentService = new AgentService();
