import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { comparePassword } from '../utils/bcrypt';
import { signToken, verifyToken } from '../utils/jwt';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await UserModel.findByEmail(email);

      if (!user || !user.password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = signToken({
        id: user.usuario_id,
        email: user.email,
        role: user.rol_nombre,
      });

      return res.json({ token });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async validate(req: Request, res: Response) {
    // Si llega aquí es porque el middleware authenticateToken ya validó el token
    // y adjuntó el usuario a (req as any).user
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    return res.json({ valid: true, user });
  }
}
