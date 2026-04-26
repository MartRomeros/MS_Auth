import { z } from 'zod';

export const userSchema = z.object({
  usuario_id: z.number(),
  email: z.string().email(),
  password: z.string().optional(),
  rol_nombre: z.string(),
});

export type User = z.infer<typeof userSchema>;
