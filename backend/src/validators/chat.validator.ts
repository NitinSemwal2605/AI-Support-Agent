import { z } from 'zod';

export const chatRequestSchema = z.object({
  message: z
    .string({
      required_error: 'Message is required',
      invalid_type_error: 'Message must be a string',
    })
    .trim()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message cannot exceed 5000 characters'),

  sessionId: z
    .string()
    .uuid('sessionId must be a valid UUID')
    .optional()
    .nullable(),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
