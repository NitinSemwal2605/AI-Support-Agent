import axios, { AxiosError } from 'axios';
import type {
  ChatResponse,
  ConversationResponse,
  ConversationsListResponse,
  ApiError,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30s for LLM calls
});

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.data?.error) {
      const apiErr = new Error(error.response.data.error);
      (apiErr as Error & { statusCode: number }).statusCode = error.response.status;
      return Promise.reject(apiErr);
    }
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return Promise.reject(new Error('Request timed out. The AI is taking too long — please try again.'));
    }
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    return Promise.reject(error);
  }
);

export const chatApi = {
  sendMessage: async (message: string, sessionId?: string): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/chat/message', {
      message,
      sessionId: sessionId || undefined,
    });
    return response.data;
  },

  getConversation: async (id: string): Promise<ConversationResponse> => {
    const response = await api.get<ConversationResponse>(`/conversations/${id}`);
    return response.data;
  },

  listConversations: async (): Promise<ConversationsListResponse> => {
    const response = await api.get<ConversationsListResponse>('/conversations');
    return response.data;
  },

  deleteConversation: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/conversations/${id}`);
    return response.data;
  },
};

export default api;
