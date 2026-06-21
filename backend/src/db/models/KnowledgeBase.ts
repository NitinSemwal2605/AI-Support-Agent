import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize';
import { IKnowledgeBase } from '../../types';

// Implement Interface
export class KnowledgeBase extends Model implements IKnowledgeBase {
  public id!: string;
  public title!: string;
  public content!: string;
  public category!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

KnowledgeBase.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'KnowledgeBase',
    tableName: 'knowledge_base',
    timestamps: true,
  }
);

export default KnowledgeBase;
