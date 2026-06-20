import { useState, useCallback, useEffect, useRef } from 'react';
import { chatApi } from '../services/api';
import type { OptimisticMessage, ConversationListItem } from '../types';

const SESSION_KEY = 'spur_session_id';
const CONVERSATIONS_KEY = 'spur_conversations';

function generateId(): string {
  return crypto.randomUUID();
}

function loadSessionId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function saveSessionId(id: string): void {
  try {
    localStorage.setItem(SESSION_KEY, id);
  } catch {
    // localStorage might be unavailable in private browsing
  }
}

function loadConversations(): ConversationListItem[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveConversations(conversations: ConversationListItem[]): void {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch {
    // ignore
  }
}

export function useChat() {
  const [messages, setMessages] = useState<OptimisticMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(loadSessionId);
  const [isRestoringSession, setIsRestoringSession] = useState(false);
  const [conversations, setConversations] = useState<ConversationListItem[]>(loadConversations);
  const hasInitialized = useRef(false);

  // Restore chat history from server on mount
  useEffect(() => {
    const storedSessionId = loadSessionId();
    if (storedSessionId && !hasInitialized.current) {
      hasInitialized.current = true;
      setIsRestoringSession(true);

      chatApi
        .getConversation(storedSessionId)
        .then((data) => {
          const restored: OptimisticMessage[] = data.messages.map((msg) => ({
            id: msg.id,
            sender: msg.sender,
            content: msg.content,
            createdAt: msg.createdAt,
          }));
          setMessages(restored);
          setSessionId(storedSessionId);
        })
        .catch(() => {
          // Session not found in DB — clear it and start fresh
          localStorage.removeItem(SESSION_KEY);
          setSessionId(null);
        })
        .finally(() => {
          setIsRestoringSession(false);
        });
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);

      // Optimistic UI — show user message immediately
      const userMsg: OptimisticMessage = {
        id: generateId(),
        sender: 'user',
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const response = await chatApi.sendMessage(content.trim(), sessionId || undefined);

        // Persist session
        if (!sessionId || sessionId !== response.sessionId) {
          saveSessionId(response.sessionId);
          setSessionId(response.sessionId);

          // Add to conversations list
          const newConv: ConversationListItem = {
            id: response.sessionId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const updated = [newConv, ...conversations.filter((c) => c.id !== response.sessionId)];
          setConversations(updated);
          saveConversations(updated);
        }

        // Add AI response
        const aiMsg: OptimisticMessage = {
          id: generateId(),
          sender: 'ai',
          content: response.reply,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (err) {
        const error = err as Error;
        setError(error.message || 'Something went wrong. Please try again.');
        // Remove optimistic user message on failure
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId, conversations]
  );

  const startNewConversation = useCallback(() => {
    // Archive current session before clearing
    if (sessionId && messages.length > 0) {
      const existingConv: ConversationListItem = {
        id: sessionId,
        createdAt: messages[0]?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: messages.slice(-1) as never,
      };
      const updated = [existingConv, ...conversations.filter((c) => c.id !== sessionId)];
      setConversations(updated);
      saveConversations(updated);
    }

    localStorage.removeItem(SESSION_KEY);
    setSessionId(null);
    setMessages([]);
    setError(null);
  }, [sessionId, messages, conversations]);

  const loadConversation = useCallback(async (id: string) => {
    if (id === sessionId) return;

    setIsRestoringSession(true);
    setError(null);

    try {
      const data = await chatApi.getConversation(id);
      const restored: OptimisticMessage[] = data.messages.map((msg) => ({
        id: msg.id,
        sender: msg.sender,
        content: msg.content,
        createdAt: msg.createdAt,
      }));
      setMessages(restored);
      setSessionId(id);
      saveSessionId(id);
    } catch {
      setError('Failed to load conversation.');
    } finally {
      setIsRestoringSession(false);
    }
  }, [sessionId]);

  const dismissError = useCallback(() => setError(null), []);

  return {
    messages,
    isLoading,
    isRestoringSession,
    error,
    sessionId,
    conversations,
    sendMessage,
    startNewConversation,
    loadConversation,
    dismissError,
  };
}
