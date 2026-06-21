export type MessageSender = 'user' | 'ai';

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface ConversationListItem {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[]; // last message for preview
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

export interface ConversationResponse {
  conversation: Conversation;
  messages: Message[];
}

export interface ConversationsListResponse {
  conversations: ConversationListItem[];
}

export interface ApiError {
  error: string;
  details?: Array<{ field: string; message: string }>;
}

// UI-only message type (before server assigns an ID)
export interface OptimisticMessage {
  id: string;
  sender: MessageSender;
  content: string;
  createdAt: string;
  pending?: boolean;
}
