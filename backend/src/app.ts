import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import chatRoutes from './routes/chat.routes';
import { sequelize } from './db';
import { connectRedis } from './db/redis';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 20,                  // Max 20 requests per minute per IP
  message: { error: 'Too many requests. Please wait a moment before sending another message.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'spur-support-backend',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/chat', chatLimiter, chatRoutes);
// Alias for conversation routes (accessible both ways)
app.use('/api', chatRoutes);

// ─── 404 + Error Handling ─────────────────────────────────────────────────────
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3001', 10);

sequelize.sync({ alter: true }).then(async () => {
  console.log('📦 Database synced with Sequelize.');
  
  // Try to connect to Redis, but don't crash if it fails
  await connectRedis();
  
  app.listen(PORT, () => {
    console.log(`
    🚀 Spur Support Backend running
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    📍 Local:   http://localhost:${PORT}
    🏥 Health:  http://localhost:${PORT}/health
    🌍 Env:     ${process.env.NODE_ENV || 'development'}
    `);
  });
}).catch((error) => {
  console.error('❌ Database sync failed:', error);
});

export default app;
