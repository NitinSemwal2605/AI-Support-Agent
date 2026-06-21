import sequelize from './sequelize';
import Conversation from './models/Conversation';
import Message from './models/Message';
import KnowledgeBase from './models/KnowledgeBase';

// ==========================================
// Define Associations (Relationships)
// ==========================================

// A Conversation can have many Messages.
// If a Conversation is deleted, all its Messages are deleted too (Cascade).
Conversation.hasMany(Message, {
  foreignKey: 'conversationId',
  as: 'messages',
  onDelete: 'CASCADE',
});

// A Message belongs to a single Conversation.
Message.belongsTo(Conversation, {
  foreignKey: 'conversationId',
  as: 'conversation',
});

export {
  sequelize,
  Conversation,
  Message,
  KnowledgeBase,
};
