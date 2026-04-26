import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodObject } from 'zod';

export const validate = (schema: ZodObject<any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: err.issues.map((e: any) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};
