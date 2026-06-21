import { conversationRepository } from '../repositories/conversation.repository';
import { messageRepository } from '../repositories/message.repository';
import { IConversation, IMessage, LLMHistoryEntry, AppError } from '../types';

export class ConversationService {
  // Returns an existing conversation or creates a new one.
  // If sessionId is provided but doesn't exist in DB, creates a fresh conversation.
  async getOrCreate(sessionId?: string | null): Promise<IConversation> {
    if (sessionId) {
      const exists = await conversationRepository.exists(sessionId);
      if (exists) {
        const conversation = await conversationRepository.findById(sessionId);
        if (conversation) return conversation;
      }
    }
    return conversationRepository.create();
  }

  // Fetches the last N messages from a conversation and formats them
  // as LLM history entries (user/assistant roles).
  async getFormattedHistory(
    conversationId: string,
    limit: number = 20
  ): Promise<LLMHistoryEntry[]> {
    const messages = await messageRepository.getRecentByConversationId(conversationId, limit);

    return messages.map((msg: IMessage) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));
  }

  /**
   * Fetches a conversation with all its messages (for API response).
   */
  async getWithMessages(id: string): Promise<{ conversation: IConversation; messages: IMessage[] }> {
    const conversation = await conversationRepository.findById(id);

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    const messages = await messageRepository.getByConversationId(id);

    return { conversation, messages };
  }

  /**
   * Returns all conversations (for sidebar listing).
   */
  async listAll(): Promise<IConversation[]> {
    return conversationRepository.findAll();
  }

  /**
   * Hard deletes a conversation and all its messages.
   */
  async deleteConversation(id: string): Promise<boolean> {
    const exists = await conversationRepository.exists(id);
    if (!exists) {
      // If it's already not in the DB, consider the deletion successful.
      // This prevents errors if frontend local storage gets out of sync with DB.
      return true;
    }
    return conversationRepository.delete(id);
  }
}

export const conversationService = new ConversationService();
