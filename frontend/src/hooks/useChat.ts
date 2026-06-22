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
  // Prevents duplicate fetch in React StrictMode
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

  // Sends a message and handles the optimistic UI update
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);

      // Optimistic UI: show the message immediately before server responds
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

        // New conversation — persist the session
        if (!sessionId || sessionId !== response.sessionId) {
          saveSessionId(response.sessionId);
          setSessionId(response.sessionId);

          const title = content.substring(0, 40) + (content.length > 40 ? '...' : '');

          const newConv: ConversationListItem = {
            id: response.sessionId,
            title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const updated = [newConv, ...conversations.filter((c) => c.id !== response.sessionId)];
          setConversations(updated);
          saveConversations(updated);
        }

        // Append AI reply
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
      const firstMsg = messages[0]?.content || '';
      const title = firstMsg.substring(0, 40) + (firstMsg.length > 40 ? '...' : '');

      const existingConv: ConversationListItem = {
        id: sessionId,
        title,
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

  const deleteConversation = useCallback(async (id: string) => {
    try {
      await chatApi.deleteConversation(id);
      
      // Update local state
      const updated = conversations.filter(c => c.id !== id);
      setConversations(updated);
      saveConversations(updated);

      // If we deleted the current session, start a new one
      if (id === sessionId) {
        localStorage.removeItem(SESSION_KEY);
        setSessionId(null);
        setMessages([]);
        setError(null);
      }
    } catch {
      setError('Failed to delete conversation.');
    }
  }, [conversations, sessionId]);

  const renameConversation = useCallback(async (id: string, newTitle: string) => {
    try {
      await chatApi.renameConversation(id, newTitle);
      
      // Update local state
      const updated = conversations.map(c => 
        c.id === id ? { ...c, title: newTitle } : c
      );
      setConversations(updated);
      saveConversations(updated);
    } catch {
      setError('Failed to rename conversation.');
    }
  }, [conversations]);

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
    deleteConversation,
    renameConversation,
    dismissError,
  };
}
