import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';


interface AuthUser {
  id: number;
  role: string;
} 

export class AdminController {
  static async getDashboard(req: Request, res: Response) {
    try {
      const user = (req as Request & { user?: AuthUser }).user;

      if (!user || typeof user.id !== 'number') {
        return res.status(401).json({ message: 'User ID not found in token' });
      }

      if (String(user.role).toLowerCase() !== 'administrador') {
        return res.status(403).json({ message: 'Forbidden: admin role required' });
      }

      const dashboard = await AdminService.getDashboard(user.id);
      return res.json(dashboard);
    } catch (error) {
      if (error instanceof Error && error.message === 'ADMIN_NOT_FOUND') {
        return res.status(404).json({ message: 'Admin not found' });
      }

      console.error('Admin dashboard error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}