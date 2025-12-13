"""
Digital Ocean Gradient AI Agent Handler
Manages 5 specialized agents for the BPD Recovery App:
1. Patient DBT Coach Agent
2. Ally Conflict Resolution Agent  
3. Therapist Clinical Summary Agent
4. Crisis Intervention Agent
5. Mentalization Mirror Agent
"""

import os
import json
import httpx
from typing import Optional, Dict, Any, Literal
from dataclasses import dataclass
from enum import Enum

# Digital Ocean Gradient AI Configuration
GRADIENT_AI_BASE_URL = os.getenv("GRADIENT_AI_BASE_URL", "https://api.gradient.ai/api")
GRADIENT_AI_API_KEY = os.getenv("GRADIENT_AI_API_KEY", "")
GRADIENT_AI_WORKSPACE_ID = os.getenv("GRADIENT_AI_WORKSPACE_ID", "")


class AgentType(Enum):
    """Enum for the 5 specialized agents"""
    PATIENT_DBT_COACH = "patient_dbt_coach"
    ALLY_CONFLICT_RESOLUTION = "ally_conflict_resolution"
    THERAPIST_CLINICAL_SUMMARY = "therapist_clinical_summary"
    CRISIS_INTERVENTION = "crisis_intervention"
    MENTALIZATION_MIRROR = "mentalization_mirror"


@dataclass
class AgentConfig:
    """Configuration for each agent"""
    agent_id: str
    system_prompt: str
    temperature: float = 0.7
    max_tokens: int = 1024


# System prompts for each agent role
AGENT_SYSTEM_PROMPTS = {
    AgentType.PATIENT_DBT_COACH: """You are Anchor AI, a compassionate DBT (Dialectical Behavior Therapy) Coach. 
Your role is to support individuals navigating recovery from BPD (Borderline Personality Disorder).

Core Principles:
- Be validating and dialectical - acknowledge emotions while encouraging skillful behavior
- Use DBT skills language (STOP, TIPP, DEAR MAN, Opposite Action, etc.)
- Never minimize feelings, always validate the emotional experience first
- Encourage use of distress tolerance skills during high-intensity moments
- Maintain a warm, non-judgmental tone
- If user mentions self-harm or suicide, immediately recommend crisis resources and the Crisis Protocol

Response Style:
- Start with validation ("It makes sense that you feel...")
- Offer a relevant DBT skill
- End with encouragement and remind them of their strength

Remember: You are a supportive tool, not a replacement for professional therapy.""",

    AgentType.ALLY_CONFLICT_RESOLUTION: """You are a Conflict Resolution and Communication Expert specializing in supporting loved ones of people with BPD.

Your role is to:
1. TRANSLATE: Help decode emotionally charged messages from their loved one
2. DE-ESCALATE: Provide calm, logical strategies to reduce conflict
3. EDUCATE: Explain BPD-related behaviors without stigmatizing

When translating messages:
- Identify the underlying emotion (fear of abandonment, invalidation, splitting)
- Reframe the message in neutral terms
- Suggest a validating response that doesn't enable harmful behavior

Response Format for Translations:
- "What they said: [original message]"
- "What they might be feeling: [underlying emotion]"
- "Translation: [neutral interpretation]"
- "Suggested Response: [validating but boundaried reply]"

Remember: Support the supporter. They need validation too.""",

    AgentType.THERAPIST_CLINICAL_SUMMARY: """You are a Clinical Documentation Assistant for mental health professionals treating BPD patients.

Your role is to:
1. Summarize patient-reported data into clinical language
2. Highlight risk indicators and patterns
3. Suggest evidence-based interventions
4. Flag urgent concerns requiring immediate attention

Output Format:
- Patient Status Summary (1-2 sentences)
- Risk Assessment (Low/Moderate/High with reasoning)
- Notable Patterns (mood trends, skill usage, triggers)
- Recommended Interventions
- Urgent Flags (if any)

Use clinical terminology appropriately. Reference DSM-5 criteria when relevant.
Always prioritize patient safety in your assessments.""",

    AgentType.CRISIS_INTERVENTION: """You are a Crisis Intervention Specialist. Your responses must be immediate, clear, and focused on safety.

PRIORITY ORDER:
1. Assess immediate safety
2. Provide grounding techniques (TIPP: Temperature, Intense exercise, Paced breathing, Paired muscle relaxation)
3. Connect to support system
4. Document the crisis event

Crisis Response Protocol:
- If ACTIVE SUICIDAL IDEATION: Direct to 988 (Suicide & Crisis Lifeline) immediately
- If SELF-HARM URGE: Guide through ice cube/cold water technique
- If DISSOCIATION: Use 5-4-3-2-1 grounding
- If PANIC: Box breathing (4-4-4-4)

Your tone: Calm, direct, reassuring. No lengthy explanations during active crisis.

Always end with: "You are not alone. Help is available."""",

    AgentType.MENTALIZATION_MIRROR: """You are a Mentalization Coach helping users understand the mental states behind communications.

Mentalization = Understanding behavior in terms of underlying mental states (thoughts, feelings, desires, intentions).

When analyzing a message:
1. Identify the SURFACE behavior/words
2. Explore possible UNDERLYING mental states
3. Consider ALTERNATIVE interpretations
4. Suggest how to RESPOND with mentalization

Help users move from:
- "They're attacking me" → "They might be feeling scared/hurt"
- "They don't care" → "They might be overwhelmed and shutting down"
- "They're manipulating me" → "They might not know how else to get their needs met"

Goal: Reduce black-and-white thinking, increase empathy, improve communication.

Never excuse harmful behavior, but always seek to understand it."""
}


# Agent IDs from Digital Ocean Gradient AI (to be configured)
AGENT_IDS = {
    AgentType.PATIENT_DBT_COACH: os.getenv("AGENT_ID_PATIENT_DBT", ""),
    AgentType.ALLY_CONFLICT_RESOLUTION: os.getenv("AGENT_ID_ALLY", ""),
    AgentType.THERAPIST_CLINICAL_SUMMARY: os.getenv("AGENT_ID_THERAPIST", ""),
    AgentType.CRISIS_INTERVENTION: os.getenv("AGENT_ID_CRISIS", ""),
    AgentType.MENTALIZATION_MIRROR: os.getenv("AGENT_ID_MENTALIZATION", ""),
}


class GradientAIAgentHandler:
    """
    Handler for Digital Ocean Gradient AI agents.
    Manages communication with 5 specialized agents.
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        workspace_id: Optional[str] = None,
        base_url: Optional[str] = None
    ):
        self.api_key = api_key or GRADIENT_AI_API_KEY
        self.workspace_id = workspace_id or GRADIENT_AI_WORKSPACE_ID
        self.base_url = base_url or GRADIENT_AI_BASE_URL
        
        if not self.api_key:
            raise ValueError("GRADIENT_AI_API_KEY is required")
        
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "X-Gradient-Workspace-Id": self.workspace_id
        }
        
        # Initialize agent configs
        self.agents: Dict[AgentType, AgentConfig] = {}
        self._initialize_agents()
    
    def _initialize_agents(self):
        """Initialize all 5 agents with their configurations"""
        for agent_type in AgentType:
            self.agents[agent_type] = AgentConfig(
                agent_id=AGENT_IDS.get(agent_type, ""),
                system_prompt=AGENT_SYSTEM_PROMPTS[agent_type],
                temperature=0.7 if agent_type != AgentType.CRISIS_INTERVENTION else 0.3,
                max_tokens=1024 if agent_type != AgentType.THERAPIST_CLINICAL_SUMMARY else 2048
            )
    
    def get_agent_for_role(self, user_role: Literal["patient", "ally", "therapist"]) -> AgentType:
        """
        Get the appropriate primary agent based on user role.
        
        Args:
            user_role: The role of the current user
            
        Returns:
            The primary AgentType for that role
        """
        role_to_agent = {
            "patient": AgentType.PATIENT_DBT_COACH,
            "ally": AgentType.ALLY_CONFLICT_RESOLUTION,
            "therapist": AgentType.THERAPIST_CLINICAL_SUMMARY
        }
        return role_to_agent.get(user_role, AgentType.PATIENT_DBT_COACH)
    
    async def chat(
        self,
        agent_type: AgentType,
        user_message: str,
        conversation_history: Optional[list] = None,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Send a message to a specific agent and get a response.
        
        Args:
            agent_type: Which agent to use
            user_message: The user's message
            conversation_history: Previous messages in the conversation
            user_context: Additional context (mood level, recent events, etc.)
            
        Returns:
            Dict containing the agent's response and metadata
        """
        agent_config = self.agents[agent_type]
        
        # Build the messages array
        messages = [
            {"role": "system", "content": agent_config.system_prompt}
        ]
        
        # Add user context to system message if provided
        if user_context:
            context_str = self._format_user_context(user_context)
            messages[0]["content"] += f"\n\nCurrent User Context:\n{context_str}"
        
        # Add conversation history
        if conversation_history:
            messages.extend(conversation_history)
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        # Make API request to Gradient AI
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/models/{agent_config.agent_id}/completions",
                    headers=self.headers,
                    json={
                        "messages": messages,
                        "temperature": agent_config.temperature,
                        "max_tokens": agent_config.max_tokens
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()
                
                return {
                    "success": True,
                    "agent_type": agent_type.value,
                    "response": result.get("choices", [{}])[0].get("message", {}).get("content", ""),
                    "usage": result.get("usage", {}),
                    "model": result.get("model", "")
                }
                
        except httpx.HTTPStatusError as e:
            return {
                "success": False,
                "agent_type": agent_type.value,
                "error": f"HTTP error: {e.response.status_code}",
                "details": str(e)
            }
        except Exception as e:
            return {
                "success": False,
                "agent_type": agent_type.value,
                "error": "Request failed",
                "details": str(e)
            }
    
    async def chat_with_role(
        self,
        user_role: Literal["patient", "ally", "therapist"],
        user_message: str,
        conversation_history: Optional[list] = None,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Convenience method to chat using the primary agent for a user's role.
        """
        agent_type = self.get_agent_for_role(user_role)
        return await self.chat(agent_type, user_message, conversation_history, user_context)
    
    async def translate_message(self, message: str, sender_context: Optional[str] = None) -> Dict[str, Any]:
        """
        Use the Ally agent to translate an emotionally charged message.
        
        Args:
            message: The message to translate
            sender_context: Optional context about the sender's current state
        """
        prompt = f"Please translate this message from my loved one:\n\n\"{message}\""
        if sender_context:
            prompt += f"\n\nContext: {sender_context}"
        
        return await self.chat(AgentType.ALLY_CONFLICT_RESOLUTION, prompt)
    
    async def mentalize_message(self, message: str, relationship_context: Optional[str] = None) -> Dict[str, Any]:
        """
        Use the Mentalization Mirror to analyze a message.
        
        Args:
            message: The message to analyze
            relationship_context: Context about the relationship
        """
        prompt = f"Help me understand what might be behind this message:\n\n\"{message}\""
        if relationship_context:
            prompt += f"\n\nRelationship context: {relationship_context}"
        
        return await self.chat(AgentType.MENTALIZATION_MIRROR, prompt)
    
    async def get_crisis_support(self, situation: str, distress_level: int) -> Dict[str, Any]:
        """
        Get immediate crisis intervention support.
        
        Args:
            situation: Description of the current crisis
            distress_level: 1-10 scale of current distress
        """
        context = {"distress_level": distress_level, "crisis_active": True}
        prompt = f"I need help right now. Distress level: {distress_level}/10\n\nSituation: {situation}"
        
        return await self.chat(AgentType.CRISIS_INTERVENTION, prompt, user_context=context)
    
    async def generate_clinical_summary(
        self,
        patient_data: Dict[str, Any],
        time_period: str = "past_week"
    ) -> Dict[str, Any]:
        """
        Generate a clinical summary for a therapist.
        
        Args:
            patient_data: Dict containing mood logs, skill usage, journal entries, etc.
            time_period: The time period to summarize
        """
        prompt = f"""Please generate a clinical summary for the following patient data from the {time_period}:

Mood Logs: {json.dumps(patient_data.get('mood_logs', []))}
Skill Usage: {json.dumps(patient_data.get('skill_usage', []))}
Crisis Events: {json.dumps(patient_data.get('crisis_events', []))}
Journal Themes: {json.dumps(patient_data.get('journal_themes', []))}
"""
        
        return await self.chat(AgentType.THERAPIST_CLINICAL_SUMMARY, prompt)
    
    def _format_user_context(self, context: Dict[str, Any]) -> str:
        """Format user context into a readable string for the system prompt."""
        lines = []
        if "mood_level" in context:
            lines.append(f"- Current mood level: {context['mood_level']}/10")
        if "distress_level" in context:
            lines.append(f"- Current distress level: {context['distress_level']}/10")
        if "recent_skills_used" in context:
            lines.append(f"- Recently used skills: {', '.join(context['recent_skills_used'])}")
        if "crisis_active" in context:
            lines.append(f"- Crisis active: {context['crisis_active']}")
        if "time_since_last_crisis" in context:
            lines.append(f"- Time since last crisis: {context['time_since_last_crisis']}")
        return "\n".join(lines) if lines else "No additional context provided."


# Synchronous wrapper for non-async contexts
class SyncGradientAIAgentHandler:
    """Synchronous wrapper for the async agent handler."""
    
    def __init__(self, *args, **kwargs):
        import asyncio
        self._async_handler = GradientAIAgentHandler(*args, **kwargs)
        self._loop = asyncio.new_event_loop()
    
    def chat(self, *args, **kwargs):
        return self._loop.run_until_complete(self._async_handler.chat(*args, **kwargs))
    
    def chat_with_role(self, *args, **kwargs):
        return self._loop.run_until_complete(self._async_handler.chat_with_role(*args, **kwargs))
    
    def translate_message(self, *args, **kwargs):
        return self._loop.run_until_complete(self._async_handler.translate_message(*args, **kwargs))
    
    def mentalize_message(self, *args, **kwargs):
        return self._loop.run_until_complete(self._async_handler.mentalize_message(*args, **kwargs))
    
    def get_crisis_support(self, *args, **kwargs):
        return self._loop.run_until_complete(self._async_handler.get_crisis_support(*args, **kwargs))
    
    def generate_clinical_summary(self, *args, **kwargs):
        return self._loop.run_until_complete(self._async_handler.generate_clinical_summary(*args, **kwargs))


# Factory function for easy instantiation
def create_agent_handler(sync: bool = False) -> GradientAIAgentHandler | SyncGradientAIAgentHandler:
    """
    Create an agent handler instance.
    
    Args:
        sync: If True, returns a synchronous handler. Otherwise returns async handler.
    """
    if sync:
        return SyncGradientAIAgentHandler()
    return GradientAIAgentHandler()


# Example usage and testing
if __name__ == "__main__":
    import asyncio
    
    async def test_agents():
        # Note: This requires valid API credentials
        handler = GradientAIAgentHandler()
        
        # Test patient agent
        print("Testing Patient DBT Coach...")
        response = await handler.chat_with_role(
            "patient",
            "I'm feeling really overwhelmed right now. My friend hasn't texted me back in 2 hours and I'm spiraling.",
            user_context={"mood_level": 3, "distress_level": 7}
        )
        print(f"Response: {response}\n")
        
        # Test ally translator
        print("Testing Ally Translator...")
        response = await handler.translate_message(
            "You never care about me! You're just like everyone else who abandons me!",
            sender_context="Partner has BPD, currently in a depressive episode"
        )
        print(f"Response: {response}\n")
        
        # Test crisis support
        print("Testing Crisis Support...")
        response = await handler.get_crisis_support(
            "I'm having urges to hurt myself",
            distress_level=9
        )
        print(f"Response: {response}\n")
    
    # Run tests
    asyncio.run(test_agents())
