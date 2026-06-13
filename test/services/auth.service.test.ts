import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../src/services/auth.service';
import { UserModel } from '../../src/models/user.model';
import * as bcryptUtils from '../../src/utils/bcrypt';
import * as jwtUtils from '../../src/utils/jwt';

vi.mock('../../src/models/user.model', () => ({
  UserModel: {
    findByEmail: vi.fn(),
    findProfileById: vi.fn(),
  },
}));

vi.mock('../../src/utils/bcrypt', () => ({
  comparePassword: vi.fn(),
  hashPassword: vi.fn(),
}));

vi.mock('../../src/utils/jwt', () => ({
  signToken: vi.fn(),
  verifyToken: vi.fn(),
}));

const mockUser = {
  usuario_id: 1,
  email: 'test@test.com',
  password: 'hashed_password',
  rol_nombre: 'estudiante',
};

const mockProfile = {
  usuario_id: 1,
  nombre: 'Test',
  email: 'test@test.com',
  rol: { rol_id: 1, nombre: 'estudiante' },
};

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('lanza "Invalid credentials" cuando el usuario no existe', async () => {
      vi.mocked(UserModel.findByEmail).mockResolvedValue(null);

      await expect(AuthService.login('no@existe.com', 'pass')).rejects.toThrow('Invalid credentials');
    });

    it('lanza "Invalid credentials" cuando el usuario no tiene password', async () => {
      vi.mocked(UserModel.findByEmail).mockResolvedValue({ ...mockUser, password: null } as any);

      await expect(AuthService.login('test@test.com', 'pass')).rejects.toThrow('Invalid credentials');
    });

    it('lanza "Invalid credentials" cuando la contraseña es incorrecta', async () => {
      vi.mocked(UserModel.findByEmail).mockResolvedValue(mockUser as any);
      vi.mocked(bcryptUtils.comparePassword).mockResolvedValue(false);

      await expect(AuthService.login('test@test.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('retorna token y perfil con credenciales válidas', async () => {
      vi.mocked(UserModel.findByEmail).mockResolvedValue(mockUser as any);
      vi.mocked(bcryptUtils.comparePassword).mockResolvedValue(true);
      vi.mocked(jwtUtils.signToken).mockReturnValue('signed.token.here');
      vi.mocked(UserModel.findProfileById).mockResolvedValue(mockProfile);

      const result = await AuthService.login('test@test.com', 'correct');

      expect(result).toEqual({ token: 'signed.token.here', profile: mockProfile });
      expect(jwtUtils.signToken).toHaveBeenCalledWith({
        id: 1,
        email: 'test@test.com',
        role: 'estudiante',
      });
    });
  });

  describe('validateToken', () => {
    it('retorna { valid: true, user } con payload válido', async () => {
      const payload = { id: 1, email: 'a@b.com', role: 'docente' };

      const result = await AuthService.validateToken(payload);

      expect(result).toEqual({ valid: true, user: payload });
    });

    it('lanza error con payload inválido (id no es número)', async () => {
      await expect(AuthService.validateToken({ id: 'malo', email: 'a@b.com', role: 'x' })).rejects.toThrow(
        'Invalid or expired token',
      );
    });

    it('lanza error con payload incompleto', async () => {
      await expect(AuthService.validateToken({})).rejects.toThrow('Invalid or expired token');
    });
  });

  describe('getProfile', () => {
    it('retorna el perfil cuando el usuario existe', async () => {
      vi.mocked(UserModel.findProfileById).mockResolvedValue(mockProfile);

      const result = await AuthService.getProfile(1);

      expect(result).toEqual(mockProfile);
      expect(UserModel.findProfileById).toHaveBeenCalledWith(1);
    });

    it('lanza "User not found" cuando el perfil es null', async () => {
      vi.mocked(UserModel.findProfileById).mockResolvedValue(null);

      await expect(AuthService.getProfile(99)).rejects.toThrow('User not found');
    });
  });
});
