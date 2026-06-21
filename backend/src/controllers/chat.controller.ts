import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service';
import { conversationService } from '../services/conversation.service';
import { AppError } from '../types';

export class ChatController {
  // Processes a user message and returns an AI reply.
  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { message, sessionId } = req.body;

      const result = await chatService.processMessage({
        message: message.trim(),
        sessionId: sessionId || undefined,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/conversations/:id
   * Returns a conversation and all its messages.
   */
  async getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        throw new AppError('Conversation ID is required', 400);
      }

      const result = await conversationService.getWithMessages(id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/conversations
   * Returns a list of all conversations (for sidebar).
   */
  async listConversations(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversations = await conversationService.listAll();
      res.status(200).json({ conversations });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/conversations/:id
   * Deletes a conversation.
   */
  async deleteConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        throw new AppError('Conversation ID is required', 400);
      }

      await conversationService.deleteConversation(id);
      res.status(200).json({ success: true, message: 'Conversation deleted' });
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
