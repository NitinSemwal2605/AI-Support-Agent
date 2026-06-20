import prisma from '../db/prisma';
import { IMessage, MessageSender, DatabaseError } from '../types';

interface CreateMessageParams {
  conversationId: string;
  sender: MessageSender;
  content: string;
}

export class MessageRepository {
  async create(params: CreateMessageParams): Promise<IMessage> {
    try {
      return await prisma.message.create({
        data: {
          conversationId: params.conversationId,
          sender: params.sender,
          content: params.content,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to save message');
    }
  }

  async getByConversationId(conversationId: string): Promise<IMessage[]> {
    try {
      return await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      throw new DatabaseError('Failed to fetch messages');
    }
  }

  async getRecentByConversationId(
    conversationId: string,
    limit: number = 20
  ): Promise<IMessage[]> {
    try {
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      // Return in chronological order
      return messages.reverse();
    } catch (error) {
      throw new DatabaseError('Failed to fetch recent messages');
    }
  }
}

export const messageRepository = new MessageRepository();
