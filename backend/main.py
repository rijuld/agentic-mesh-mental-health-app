"""
BPD Recovery App - FastAPI Backend
Handles API routes for the mobile app and AI agent integration
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Literal
from dotenv import load_dotenv

from agents import GradientAIAgentHandler, AgentType, create_agent_handler

load_dotenv()

app = FastAPI(
    title="Anchor BPD Recovery API",
    description="Backend API for the Anchor BPD Recovery mobile application",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent_handler: Optional[GradientAIAgentHandler] = None


def get_agent_handler() -> GradientAIAgentHandler:
    global agent_handler
    if agent_handler is None:
        agent_handler = create_agent_handler(sync=False)
    return agent_handler


class ChatRequest(BaseModel):
    agent_type: str
    message: str
    conversation_history: Optional[List[dict]] = None
    user_context: Optional[dict] = None


class ChatWithRoleRequest(BaseModel):
    role: Literal["patient", "ally", "therapist"]
    message: str
    conversation_history: Optional[List[dict]] = None
    user_context: Optional[dict] = None


class TranslateRequest(BaseModel):
    message: str
    sender_context: Optional[str] = None


class MentalizeRequest(BaseModel):
    message: str
    relationship_context: Optional[str] = None


class CrisisRequest(BaseModel):
    situation: str
    distress_level: int


class ClinicalSummaryRequest(BaseModel):
    patient_id: str
    time_period: str = "past_week"


@app.get("/")
async def root():
    return {"message": "Anchor BPD Recovery API", "status": "healthy"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/agents/chat")
async def chat_with_agent(
    request: ChatRequest,
    handler: GradientAIAgentHandler = Depends(get_agent_handler)
):
    try:
        agent_type = AgentType(request.agent_type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid agent type: {request.agent_type}")
    
    result = await handler.chat(
        agent_type=agent_type,
        user_message=request.message,
        conversation_history=request.conversation_history,
        user_context=request.user_context
    )
    return result


@app.post("/api/agents/chat-with-role")
async def chat_with_role(
    request: ChatWithRoleRequest,
    handler: GradientAIAgentHandler = Depends(get_agent_handler)
):
    result = await handler.chat_with_role(
        user_role=request.role,
        user_message=request.message,
        conversation_history=request.conversation_history,
        user_context=request.user_context
    )
    return result


@app.post("/api/agents/translate")
async def translate_message(
    request: TranslateRequest,
    handler: GradientAIAgentHandler = Depends(get_agent_handler)
):
    result = await handler.translate_message(
        message=request.message,
        sender_context=request.sender_context
    )
    return result


@app.post("/api/agents/mentalize")
async def mentalize_message(
    request: MentalizeRequest,
    handler: GradientAIAgentHandler = Depends(get_agent_handler)
):
    result = await handler.mentalize_message(
        message=request.message,
        relationship_context=request.relationship_context
    )
    return result


@app.post("/api/agents/crisis")
async def get_crisis_support(
    request: CrisisRequest,
    handler: GradientAIAgentHandler = Depends(get_agent_handler)
):
    if not 1 <= request.distress_level <= 10:
        raise HTTPException(status_code=400, detail="Distress level must be between 1 and 10")
    
    result = await handler.get_crisis_support(
        situation=request.situation,
        distress_level=request.distress_level
    )
    return result


@app.post("/api/agents/clinical-summary")
async def generate_clinical_summary(
    request: ClinicalSummaryRequest,
    handler: GradientAIAgentHandler = Depends(get_agent_handler)
):
    mock_patient_data = {
        "mood_logs": [
            {"date": "2024-01-15", "level": 4, "note": "Difficult morning"},
            {"date": "2024-01-16", "level": 3, "note": "Urge to self-harm"},
            {"date": "2024-01-17", "level": 5, "note": "Used TIPP successfully"},
        ],
        "skill_usage": ["TIPP", "Opposite Action", "Check the Facts"],
        "crisis_events": [
            {"date": "2024-01-16", "distress_level": 8, "intervention": "Cold Water", "successful": True}
        ],
        "journal_themes": ["abandonment fears", "relationship conflict"]
    }
    
    result = await handler.generate_clinical_summary(
        patient_data=mock_patient_data,
        time_period=request.time_period
    )
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
