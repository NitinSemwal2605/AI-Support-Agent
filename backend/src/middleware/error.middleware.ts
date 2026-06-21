import { Request, Response, NextFunction } from 'express';
import { AppError, LLMError, DatabaseError, RateLimitError } from '../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Operational errors — safe to expose message to client
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Gemini API errors
  if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('invalid_api_key')) {
    res.status(503).json({ error: 'AI service unavailable' });
    return;
  }

  if (err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('rate_limit')) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  // Sequelize / Database errors
  if (err.name === 'SequelizeError' || err.name?.startsWith('Sequelize')) {
    console.error('Database error:', err);
    res.status(503).json({ error: 'Database unavailable' });
    return;
  }

  // Unknown errors — don't leak internals
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      message: err.message,
      stack: err.stack,
    }),
  });
};

// 404 handler — must be registered before errorMiddleware
export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
};
