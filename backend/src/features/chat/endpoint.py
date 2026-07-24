from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI

# Router for chat-related endpoints
router = APIRouter(prefix="/api/chat", tags=["chat"])

# Initialize OpenAI client
client = OpenAI()

# Request model for the chat endpoint
class ChatRequest(BaseModel):
    message: str


# Response model for the chat endpoint
class ChatResponse(BaseModel):
    message: str | None

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest) -> ChatResponse:
    try:
        response = client.chat.completions.create(
            # model="gpt-4o-mini",
            model="gpt-4o",
            messages=[{"role": "user", "content": payload.message}],
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Failed to generate chat response") from exc

    text = response.choices[0].message.content

    return ChatResponse(message=text)