import { Request, Response } from 'express';
import { StudentService } from '../services/student.service';

interface AuthUser {
  id: number;
  role: string;
}

export class StudentController {
  static async getDashboard(req: Request, res: Response) {
    try {
      const user = (req as Request & { user?: AuthUser }).user;

      if (!user || typeof user.id !== 'number') {
        return res.status(401).json({ message: 'User ID not found in token' });
      }

      if (String(user.role).toLowerCase() !== 'estudiante') {
        return res.status(403).json({ message: 'Forbidden: student role required' });
      }

      const dashboard = await StudentService.getDashboard(user.id);
      return res.json(dashboard);
    } catch (error) {
      if (error instanceof Error && error.message === 'STUDENT_NOT_FOUND') {
        return res.status(404).json({ message: 'Student not found' });
      }

      console.error('Student dashboard error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}