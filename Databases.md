# Database & ORM Learning Path

This project uses **PostgreSQL** as the relational database and **Sequelize** as the ORM (Object-Relational Mapper) to interact with it via TypeScript. Here are the key topics you need to learn to understand the database layer.

## 1. PostgreSQL Fundamentals
Understanding the underlying concepts is critical.
- **Relational Data**: How tables relate to one another (e.g., Conversations and Messages).
- **Data Types**: `UUID` (Universally Unique Identifier), `TEXT`, `TIMESTAMP`.
- **Primary & Foreign Keys**: How rows are uniquely identified and how they reference rows in other tables.
- **Cascading Deletes**: What happens when a parent record is deleted (e.g., deleting a Conversation deletes all its Messages).

## 2. Sequelize Models (`src/db/models/`)
Each model file is a TypeScript class that maps to a PostgreSQL table.
- **Model Definition**: `export class Message extends Model implements IMessage { ... }`.
- **Field Configuration**:
  - `primaryKey: true`: Marks a field as the primary key.
  - `defaultValue: DataTypes.UUIDV4`: Auto-generates a UUID for new records.
  - `timestamps: true`: Automatically manages `createdAt` and `updatedAt`.
  - `DataTypes.TEXT`: Specifies a text column for long content.
- **Associations**: Defined in `src/db/index.ts` using `Conversation.hasMany(Message)` and `Message.belongsTo(Conversation)`.
- **Validation**: Inline validators like `validate: { isIn: [['user', 'ai']] }` to restrict the `sender` field.

## 3. Sequelize Queries (in TypeScript)
The Sequelize queries are used in the `src/repositories` folder.
- **Queries**: `Message.findAll()`, `Conversation.create()`, `KnowledgeBase.findAll()`.
- **Filtering & Sorting**: Using `where` clauses and sorting with `order: [['createdAt', 'ASC']]`.
- **Eager Loading**: Using `include: [{ model: Message, as: 'messages' }]` to fetch related records in a single query.
- **Converting to JSON**: Using `.toJSON()` to convert Sequelize model instances to plain objects.

---
**Recommendation**: Start by reading the model files in `src/db/models/` to visualize the data structure. Then look at `src/repositories/` to see how Sequelize queries are used to insert and fetch data.
