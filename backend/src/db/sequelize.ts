import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Ensure env variables are loaded (helpful for scripts or if app.ts hasn't loaded it yet)
dotenv.config();

// Initialize Sequelize with the PostgreSQL connection string.
// We use the DATABASE_URL environment variable provided in the .env file.
const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

export default sequelize;
