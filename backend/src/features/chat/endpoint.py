from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os

# Router for chat-related endpoints
router = APIRouter(prefix="/api/chat", tags=["chat"])

# Request model for the chat endpoint
class ChatRequest(BaseModel):
    message: str

# Response model for the chat endpoint
class ChatResponse(BaseModel):
    message: str | None

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest) -> ChatResponse:
    try:
        # Read API key from environment and instantiate OpenAI client per-request
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=502, detail="OPENAI_API_KEY not set in environment")

        try:
            client = OpenAI(api_key=api_key)
        except TypeError as te:
            raise HTTPException(status_code=502, detail=f"OpenAI client initialization failed: {te}")

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": payload.message}],
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Failed to generate chat response") from exc

    text = response.choices[0].message.content

    return ChatResponse(message=text)