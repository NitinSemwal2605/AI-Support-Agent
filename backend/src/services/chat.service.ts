import { conversationService } from './conversation.service';
import { conversationRepository } from '../repositories/conversation.repository';
import { messageRepository } from '../repositories/message.repository';
import { llmService } from './llm.service';
import { KnowledgeBase } from '../db';
import { ChatRequest, ChatResponse } from '../types';
import { redisClient, isRedisConnected } from '../db/redis';

export class ChatService {
  /**
   * Full chat flow:
   * 1. Get or create conversation
   * 2. Save user message
   * 3. Fetch conversation history (last 20 messages)
   * 4. Fetch all knowledge base entries
   * 5. Call LLM
   * 6. Save AI response
   * 7. Return reply + sessionId
   */
  async processMessage(input: ChatRequest): Promise<ChatResponse> {
    const { message, sessionId } = input;

    // Step 1: Get or create conversation
    const conversation = await conversationService.getOrCreate(sessionId);

    // If it's a new conversation or title is missing, set a title based on the first message
    if (!conversation.title) {
      const title = message.substring(0, 40) + (message.length > 40 ? '...' : '');
      await conversationRepository.updateTitle(conversation.id, title);
      conversation.title = title; // Update local object
    }

    // Step 2: Save user message
    await messageRepository.create({
      conversationId: conversation.id,
      sender: 'user',
      content: message,
    });

    // Step 3: Fetch conversation history
    const history = await conversationService.getFormattedHistory(conversation.id, 20);
    // Remove the last entry (user message we just added) since we pass it separately to LLM
    const historyWithoutCurrent = history.slice(0, -1);

    // Step 4: Fetch knowledge base (with Redis cache)
    let knowledgeBase: string[] = [];
    const CACHE_KEY = 'kb:all_entries';
    if (isRedisConnected) {
      try {
        const cachedKB = await redisClient.get(CACHE_KEY);
        if (cachedKB) {
          knowledgeBase = JSON.parse(cachedKB);
          console.log('Cache Hit: Loaded Knowledge Base from Redis');
        }
      } catch (err) {
        console.warn('Redis GET failed, falling back to database', err);
      }
    }

    // Cache miss — fetch from Postgres and populate Redis
    if (knowledgeBase.length === 0) {
      console.log('Cache Miss: Fetching Knowledge Base from PostgreSQL');
      const knowledgeEntries = await KnowledgeBase.findAll({
        order: [['createdAt', 'ASC']],
      });

      knowledgeBase = knowledgeEntries.map(
        (entry) => `### ${entry.title}\n${entry.content}`
      );

      // Cache for 1 hour
      if (isRedisConnected && knowledgeBase.length > 0) {
        try {
          await redisClient.setEx(CACHE_KEY, 3600, JSON.stringify(knowledgeBase));
        } catch (err) {
          console.warn('Redis SET failed', err);
        }
      }
    }

    // Step 5: Generate AI reply
    const reply = await llmService.generateReply(historyWithoutCurrent, message, knowledgeBase);

    // Step 6: Save AI response
    await messageRepository.create({
      conversationId: conversation.id,
      sender: 'ai',
      content: reply,
    });

    // Step 7: Return response
    return {
      reply,
      sessionId: conversation.id,
    };
  }
}

export const chatService = new ChatService();
