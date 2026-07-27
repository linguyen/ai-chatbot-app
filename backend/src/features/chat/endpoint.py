from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel
from openai import OpenAI
from typing import Annotated
import os

from src.core.sanitization import sanitize_channel_id_domain

# Router for chat-related endpoints
router = APIRouter(prefix="/api/chat", tags=["chat"])

# Request model for the chat endpoint
class ChatRequest(BaseModel):
    message: str

# Response model for the chat endpoint
class ChatResponse(BaseModel):
    message: str | None

def _build_prompt(payload_message: str, channel_id: str | None = None) -> str:
    channel_context = ""
    if channel_id != "umbraco.vn":
        channel_context = (
            "TDP Binh An 1 and TDP Binh An 3 => TDP Binh An\n"
            "TDP Tan Thien 1, TDP Tan Thien 2 and TDP Tan Thien 3 => TDP Tan Thien.\n"
            "TDP Tan An 1, TDP Tan An 2 and TDP Tan An 3 => TDP Tan An.\n"
        )
    else:
        channel_context = (
            "You are a Umbraco Vietnam assistant. You answer questions about Umbraco Vietnam when user ask or chat.\n"
            "You provide the best services at affordable prices.\n"
            "You have over 10 years of experience working with Umbraco for global clients across Australia, the US, and Europe.\n"
            "You typically charge $20/hour for long-term projects and $30/hour for short-term projects.\n"
            "You work remotely or on-site in Vietnam. You can also visit clients if necessary.\n"
            "New Umbraco versions are released every six months. You stay up to date with the latest releases and have experience working with Umbraco 18.\n"
            "You can migrate websites from older Umbraco versions to the latest version. You can also migrate websites from other CMS platforms to Umbraco.\n"
            "You specialise in SEO and performance optimisation. You can also help clients improve security and compliance.\n"
            "You do not host your website or sensitive data on your own UAT or staging environments during development. Clients are required to provide their own hosting and database for the project.\n"
            "You can deploy and host Umbraco on cloud platforms such as AWS, Azure, or Umbraco Cloud.\n"
            "You focus on developing AI assistants for Umbraco projects. You can help clients integrate AI-powered chatbots, RAG solutions, AI features, and more.\n"
            "You can build custom Umbraco plugins based on clients' requirements. You can also develop bespoke features for Umbraco.\n"
        )
    return (
        "SYSTEM:\n "
        "Phase 1: If it is a greeting question, you are allowed to be a helpful assistant\n. Use the [CONTEXT 1].\n "
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
        "Answer shortly and concisely to reduce cost.\n "
        "If the answer is missing say 'I don't know'.\n Use the [CONTEXT 2]"
        "[CONTEXT 2]:\n "
        + channel_context
        + "QUESTION: \n "
        + payload_message
    )


def _generate_chat_response(payload: ChatRequest, channel_id: str | None = None) -> ChatResponse:
    try:
        # Read API key from environment and instantiate OpenAI client per-request
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=502, detail="OPENAI_API_KEY not set in environment")

        try:
            client = OpenAI(api_key=api_key)
        except TypeError as te:
            raise HTTPException(status_code=502, detail=f"OpenAI client initialization failed: {te}")

        message = _build_prompt(payload.message, channel_id)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "assistant", "content": message}],
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Failed to generate chat response") from exc

    text = response.choices[0].message.content

    return ChatResponse(message=text)


@router.post("/", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest) -> ChatResponse:
    return _generate_chat_response(payload)


@router.post("/{channel_id}", response_model=ChatResponse)
async def chat_endpoint_by_channel(
    channel_id: Annotated[
        str,
        Path(
            min_length=3,
            max_length=253,
            description="Channel ID in domain format, e.g. umbraco.vn",
        ),
    ],
    payload: ChatRequest,
) -> ChatResponse:
    try:
        sanitized_channel_id = sanitize_channel_id_domain(channel_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return _generate_chat_response(payload, sanitized_channel_id)