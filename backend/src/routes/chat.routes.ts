import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { validate } from '../middleware/validation.middleware';
import { chatRequestSchema } from '../validators/chat.validator';

const router = Router();

// POST /api/chat/message — send a message
router.post(
  '/message',
  validate(chatRequestSchema),
  (req, res, next) => chatController.sendMessage(req, res, next)
);

// GET /api/conversations — list all conversations (sidebar)
router.get(
  '/conversations',
  (req, res, next) => chatController.listConversations(req, res, next)
);

// GET /api/conversations/:id — fetch a specific conversation with messages
router.get(
  '/conversations/:id',
  (req, res, next) => chatController.getConversation(req, res, next)
);

export default router;
