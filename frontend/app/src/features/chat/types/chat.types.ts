export class ChatRequest {
  message: string | null;
  constructor(message: string | null) {
    this.message = message;
  }
}

export class ChatResponse {
  message: string | null;
  constructor(message: string | null) {
    this.message = message;
  }
}