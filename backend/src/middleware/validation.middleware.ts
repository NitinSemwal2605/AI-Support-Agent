import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return function (req: Request, res: Response, next: NextFunction): void {
    try {
      // Step 1: Validate the request body
      req.body = schema.parse(req.body);

      // Step 2: If valid, move on to the controller
      next();
    } catch (err) {
      // Step 3: If validation fails, catch the Zod error and return a 400 Bad Request
      if (err instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: err.errors.map((e) => ({
            field: e.path.join('.'), // Tells us which field failed (e.g. 'message')
            message: e.message,      // Tells us why it failed (e.g. 'Message cannot be empty')
          })),
        });
        return;
      }

      // If it's some other random error, pass it to the global error handler
      next(err);
    }
  };
}
