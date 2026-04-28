import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(3, { message: 'Password must be at least 6 characters long' }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const tokenPayloadSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: z.string(),
});

export type JWTPayload = z.infer<typeof tokenPayloadSchema>;
