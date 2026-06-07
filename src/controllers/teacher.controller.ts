import { Request, Response } from 'express';
import { TeacherService } from '../services/teacher.service';

interface AuthUser {
  id: number;
  role: string;
}

export class TeacherController {
  static async getDashboard(req: Request, res: Response) {
    try {
      const user = (req as Request & { user?: AuthUser }).user;

      if (!user || typeof user.id !== 'number') {
        return res.status(401).json({ message: 'User ID not found in token' });
      }

      if (String(user.role).toLowerCase() !== 'docente') {
        return res.status(403).json({ message: 'Forbidden: teacher role required' });
      }

      const dashboard = await TeacherService.getDashboard(user.id);
      return res.json(dashboard);
    } catch (error) {
      console.error('Teacher dashboard error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}