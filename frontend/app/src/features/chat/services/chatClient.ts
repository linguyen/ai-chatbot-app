import axios from 'axios';
import type { ChatRequest, ChatResponse } from '../types/chat.types';

// 1. Base URL config - pointing to your Python backend (e.g., FastAPI, Flask, Django)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const DOMAIN_CHANNEL_ID_PATTERN =
  /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])$/;

const isValidChannelId = (channelId?: string): channelId is string => {
  if (!channelId) return false;
  const normalized = channelId.trim().toLowerCase();
  if (normalized.length < 3 || normalized.length > 253) return false;
  return DOMAIN_CHANNEL_ID_PATTERN.test(normalized);
};

const buildChatPath = (channelId?: string): string => {
  if (!isValidChannelId(channelId)) {
    return '/chat';
  }
  return `/chat/${encodeURIComponent(channelId.trim().toLowerCase())}`;
};

// 3. API Calling Functions
export const chatClient = {
  sendMessage: async (chatRequest: ChatRequest, channelId?: string): Promise<ChatResponse> => {
        try {
            const prompt = chatRequest.message; // You can modify this to include more context or formatting as needed
      const response = await api.post(buildChatPath(channelId), { message: prompt });
            return response.data; // Assuming the backend returns the bot's response in the data field
        }
        catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }   
    }
};