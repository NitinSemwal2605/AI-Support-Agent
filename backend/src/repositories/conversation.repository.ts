import { Conversation, Message } from '../db';
import { IConversation, DatabaseError } from '../types';

export class ConversationRepository {
  async create(): Promise<IConversation> {
    try {
      const conversation = await Conversation.create({});
      // Return plain JSON object to match IConversation interface
      return conversation.toJSON();
    } catch (error) {
      console.error('Inner Conversation.create error:', error);
      throw new DatabaseError('Failed to create conversation');
    }
  }

  async findById(id: string): Promise<IConversation | null> {
    try {
      const conversation = await Conversation.findByPk(id);
      if (!conversation) return null;

      // Fetch messages separately to avoid Sequelize's order-in-include typing issues
      const messages = await Message.findAll({
        where: { conversationId: id },
        order: [['createdAt', 'ASC']],
      });

      const result = conversation.toJSON();
      result.messages = messages.map((m) => m.toJSON());
      return result;
    } catch (error) {
      throw new DatabaseError('Failed to fetch conversation');
    }
  }

  async findAll(): Promise<IConversation[]> {
    try {
      const conversations = await Conversation.findAll({
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Message,
            as: 'messages',
            limit: 1, // Only get the latest message
          },
        ],
      });
      return conversations.map((c) => c.toJSON());
    } catch (error) {
      throw new DatabaseError('Failed to fetch conversations');
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await Conversation.count({ where: { id } });
      return count > 0;
    } catch (error) {
      throw new DatabaseError('Failed to check conversation existence');
    }
  }

  async updateTitle(id: string, title: string): Promise<void> {
    try {
      await Conversation.update({ title }, { where: { id } });
    } catch (error) {
      throw new DatabaseError('Failed to update conversation title');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const count = await Conversation.destroy({ where: { id } });
      return count > 0;
    } catch (error) {
      throw new DatabaseError('Failed to delete conversation');
    }
  }
}

export const conversationRepository = new ConversationRepository();
