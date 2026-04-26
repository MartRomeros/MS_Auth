import { UserModel } from '../models/user.model';
import { userSchema } from '../schemas/user.schema';
import { comparePassword } from '../utils/bcrypt';
import { signToken } from '../utils/jwt';

export class AuthService {
  static async login(email: string, password: string) {
    const user = await UserModel.findByEmail(email);

    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = signToken({
      id: user.usuario_id,
      email: user.email,
      role: user.rol_nombre,
    });

    return { token };
  }

  static async validateToken(userData: any) {
    const result = userSchema.safeParse(userData);

    if (!result.success) {
      throw new Error('Invalid or expired token');
    }
    return { valid: true, user: result.data };
  }
}
