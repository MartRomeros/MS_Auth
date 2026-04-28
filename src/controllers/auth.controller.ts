import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);
      return res.json(result);
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ message: error.message });
      }
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async validate(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const result = await AuthService.validateToken(user);
      return res.json(result);
    } catch (error: any) {
      return res.status(401).json({ message: error.message });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user || !user.id) {
        return res.status(401).json({ message: 'User ID not found in token' });
      }
      
      const profile = await AuthService.getProfile(user.id);
      return res.json(profile);
    } catch (error: any) {
      if (error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      console.error('Get profile error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
