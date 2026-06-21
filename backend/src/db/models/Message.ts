import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize';
import { IMessage, MessageSender } from '../../types';

// Extend the Sequelize Model class and implement Message Interface
export class Message extends Model implements IMessage {
  public id!: string;
  public conversationId!: string;
  public sender!: MessageSender;
  public content!: string;
  public readonly createdAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sender: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['user', 'ai']],
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    timestamps: true,
    updatedAt: false, // Not Needed
  }
);

export default Message;
