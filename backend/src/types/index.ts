// ─── Message Sender ───────────────────────────────────────────────────────────
export type MessageSender = 'user' | 'ai';

// ─── Database Models ──────────────────────────────────────────────────────────
export interface IConversation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: IMessage[];
}

export interface IMessage {
  id: string;
  conversationId: string;
  sender: MessageSender;
  content: string;
  createdAt: Date;
}

export interface IKnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── API Request/Response Types ───────────────────────────────────────────────
export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

export interface ConversationResponse {
  conversation: IConversation;
  messages: IMessage[];
}

// ─── LLM Provider Interface ───────────────────────────────────────────────────
export interface LLMHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export interface LLMProvider {
  generateReply(
    history: LLMHistoryEntry[],
    userMessage: string,
    knowledgeBase: string[]
  ): Promise<string>;
}

// ─── Error Types ──────────────────────────────────────────────────────────────
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class LLMError extends AppError {
  constructor(message: string) {
    super(message, 503);
    Object.setPrototypeOf(this, LLMError.prototype);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 503);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super(message, 429);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class ValidationError extends AppError {
  public readonly details: unknown;

  constructor(message: string, details?: unknown) {
    super(message, 400);
    this.details = details;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
