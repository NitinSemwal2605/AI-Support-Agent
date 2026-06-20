import { conversationService } from './conversation.service';
import { messageRepository } from '../repositories/message.repository';
import { llmService } from './llm.service';
import prisma from '../db/prisma';
import { ChatRequest, ChatResponse } from '../types';

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

    // Step 2: Save user message
    await messageRepository.create({
      conversationId: conversation.id,
      sender: 'user',
      content: message,
    });

    // Step 3: Fetch conversation history (exclude the message we just saved)
    const history = await conversationService.getFormattedHistory(conversation.id, 20);
    // Remove the last entry (user message we just added) since we pass it separately to LLM
    const historyWithoutCurrent = history.slice(0, -1);

    // Step 4: Fetch knowledge base
    const knowledgeEntries = await prisma.knowledgeBase.findMany({
      orderBy: { createdAt: 'asc' },
    });
    const knowledgeBase = knowledgeEntries.map(
      (entry) => `### ${entry.title}\n${entry.content}`
    );

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
