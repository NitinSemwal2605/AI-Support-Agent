import { Message } from '../db';
import { IMessage, MessageSender, DatabaseError } from '../types';

interface CreateMessageParams {
  conversationId: string;
  sender: MessageSender;
  content: string;
}

export class MessageRepository {
  async create(params: CreateMessageParams): Promise<IMessage> {
    try {
      const message = await Message.create({
        conversationId: params.conversationId,
        sender: params.sender,
        content: params.content,
      });
      return message.toJSON();
    } catch (error) {
      throw new DatabaseError('Failed to save message');
    }
  }

  async getByConversationId(conversationId: string): Promise<IMessage[]> {
    try {
      const messages = await Message.findAll({
        where: { conversationId },
        order: [['createdAt', 'ASC']],
      });
      // Returns models instances
      return messages.map((m) => m.toJSON());
    } catch (error) {
      throw new DatabaseError('Failed to fetch messages');
    }
  }

  async getRecentByConversationId(
    conversationId: string,
    limit: number = 20
  ): Promise<IMessage[]> {
    try {
      const messages = await Message.findAll({
        where: { conversationId },
        order: [['createdAt', 'DESC']],
        limit: limit,
      });
      const jsonMessages = messages.map((m) => m.toJSON());
      return jsonMessages.reverse();
    } catch (error) {
      throw new DatabaseError('Failed to fetch recent messages');
    }
  }
}

export const messageRepository = new MessageRepository();
