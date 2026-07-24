# Chatbot Project

A full-stack chatbot application with:

- FastAPI backend for chat API integration with OpenAI
- React + TypeScript frontend (Vite)
- Tailwind CSS v4 + DaisyUI v5 for UI styling

## Overview

This project provides a conversational UI that sends user messages to a FastAPI endpoint. The backend calls OpenAI (`gpt-4o-mini`) and returns the assistant response to the frontend.

## Tech Stack

- Backend: Python, FastAPI, Pydantic, OpenAI SDK
- Frontend: React, TypeScript, Vite, Axios
- UI: Tailwind CSS, DaisyUI (custom tropical light theme)
- Testing: Pytest (backend unit tests)

## Project Structure

```text
Chatbot/
├─ backend/
│  ├─ src/
│  │  ├─ main.py
│  │  └─ features/
│  │     ├─ chat/
│  │     │  └─ chat_api.py
│  │     └─ middleware/
│  │        └─ security_cors.py
│  └─ tests/
│     ├─ conftest.py
│     └─ test_api.py
└─ frontend/
	 └─ app/
			└─ src/
				 └─ features/
						└─ chat/
							 ├─ components/ChatPage.tsx
							 └─ services/chatClient.ts
```

## Environment Variables

Create environment variables before running the app.

Backend:

- `OPENAI_API_KEY`: Required for OpenAI requests
- `ALLOWED_ORIGINS`: Optional CORS origins list separated by commas
	- Default: `http://localhost:3000,http://localhost:5175`

Frontend:

- `VITE_API_URL`: Optional API base URL
	- Default: `http://127.0.0.1:8000/api`

## Getting Started

### 1. Backend Setup

From project root:

```powershell
cd backend
```

Use your project virtual environment (recommended):

```powershell
..\.venv\Scripts\python.exe -m pip install fastapi uvicorn python-dotenv openai pytest
```

Run the backend:

```powershell
cd src
..\..\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

Backend endpoints:

- `GET /` -> health/root response
- `POST /api/chat` -> chat endpoint

Example request body for `/api/chat`:

```json
{
	"message": "Hello"
}
```

### 2. Frontend Setup

From project root:

```powershell
cd frontend\app
npm install
npm run dev
```

Vite will start a local dev server and the UI will connect to the backend API.

## Testing

Run backend unit tests from project root:

```powershell
..\.venv\Scripts\python.exe -m pytest backend\tests -q
```

Current backend tests cover:

- root route response
- `/api/chat` success path with mocked OpenAI call
- `/api/chat` error handling (`502`)
- request validation (`422` for invalid payload)

## Notes

- `OpenAI()` in backend code reads credentials from environment variables.
- Keep API keys in environment variables or `.env` files, never hardcode secrets.
