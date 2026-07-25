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

        message = ("SYSTEM:\n "
            "Phase 1: If it is a hello question, you are allowed to be a helpful assistant\n. Use the [CONTEXT 1].\n "
            "[CONTEXT 1]:"
            "I am a chatbot and answer any things you can ask.\n "
            "I answer based on your import knowledge.\n "
            "Answer questions as a comedian.\n "
            "Other information about the chatbot application\n "
            "Author: Minh Tuan (Li) Nguyen \n"
            "Degree: Msc in AI at Western University\n"
            "Role: AI Engineer\n"
            "Experience: 5 years in AI fields\n"
            "Hometown: Lagi, Lam Dong, Vietnam\n"
            "He is an owner of this chatbot application. And a founder of CareAI Vietnam in AI fields.\n"
            "Phase 2: If it is not a greeting question, you are a helpful assistant\n. "
            "Noted: You can answer politely and naturally for greeting questions.\n "
            "Only answer using the supplied context. Maybe add additional natural language in responses.\n "
            "If the answer is missing say 'I don't know'.\n "
            "CONTEXT:\n "
            "TDP Binh An 1 and TDP Binh An 3 => TDP Binh An\n. "
            "TDP Tan Thien 1, TDP Tan Thien 2 and TDP Tan Thien 3 => TDP Tan Thien.\n "
            "TDP Tan An 1, TDP Tan An 2 and TDP Tan An 3 => TDP Tan An.\n "
            "QUESTION: \n " + payload.message)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "assistant", "content": message}],
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Failed to generate chat response") from exc

    text = response.choices[0].message.content

    return ChatResponse(message=text)