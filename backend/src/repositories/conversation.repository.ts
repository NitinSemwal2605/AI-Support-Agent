import prisma from '../db/prisma';
import { IConversation, DatabaseError } from '../types';

export class ConversationRepository {
  async create(): Promise<IConversation> {
    try {
      return await prisma.conversation.create({
        data: {},
      });
    } catch (error) {
      throw new DatabaseError('Failed to create conversation');
    }
  }

  async findById(id: string): Promise<IConversation | null> {
    try {
      return await prisma.conversation.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to fetch conversation');
    }
  }

  async findAll(): Promise<IConversation[]> {
    try {
      return await prisma.conversation.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to fetch conversations');
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await prisma.conversation.count({ where: { id } });
      return count > 0;
    } catch (error) {
      throw new DatabaseError('Failed to check conversation existence');
    }
  }
}

export const conversationRepository = new ConversationRepository();
