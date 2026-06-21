import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize';
import { IConversation, IMessage } from '../../types';

// We extend the Sequelize Model class and implement the IConversation interface.
// This ensures our Sequelize model satisfies the TypeScript types expected by the rest of the app.
export class Conversation extends Model implements IConversation {
  public id!: string;
  public title!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // This will hold the eager-loaded messages when we query
  public messages?: IMessage[];
}

// Define the schema for the Conversation model
Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Auto-generates a UUID
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // createdAt and updatedAt are automatically managed by Sequelize when timestamps: true
  },
  {
    sequelize,
    modelName: 'Conversation',
    tableName: 'conversations', // Maps to the "conversations" table in the DB
    timestamps: true,
  }
);

export default Conversation;
