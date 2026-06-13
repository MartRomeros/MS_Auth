import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthController } from '../../src/controllers/auth.controller';
import { AuthService } from '../../src/services/auth.service';

vi.mock('../../src/services/auth.service', () => ({
  AuthService: {
    login: vi.fn(),
    validateToken: vi.fn(),
    getProfile: vi.fn(),
  },
}));

const makeRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides: object = {}): any => ({ body: {}, ...overrides });

describe('AuthController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('retorna 200 con token y perfil en login exitoso', async () => {
      const data = { token: 'tok123', profile: { usuario_id: 1 } };
      vi.mocked(AuthService.login).mockResolvedValue(data as any);

      const req = makeReq({ body: { email: 'a@b.com', password: 'pass' } });
      const res = makeRes();
      await AuthController.login(req, res);

      expect(AuthService.login).toHaveBeenCalledWith('a@b.com', 'pass');
      expect(res.json).toHaveBeenCalledWith(data);
    });

    it('retorna 401 cuando las credenciales son inválidas', async () => {
      vi.mocked(AuthService.login).mockRejectedValue(new Error('Invalid credentials'));

      const req = makeReq({ body: { email: 'a@b.com', password: 'bad' } });
      const res = makeRes();
      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('retorna 500 ante error inesperado', async () => {
      vi.mocked(AuthService.login).mockRejectedValue(new Error('DB connection failed'));

      const req = makeReq({ body: { email: 'a@b.com', password: 'x' } });
      const res = makeRes();
      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('validate', () => {
    it('retorna 200 con resultado de validación', async () => {
      const payload = { id: 1, email: 'a@b.com', role: 'docente' };
      vi.mocked(AuthService.validateToken).mockResolvedValue({ valid: true, user: payload });

      const req = makeReq({ user: payload });
      const res = makeRes();
      await AuthController.validate(req, res);

      expect(res.json).toHaveBeenCalledWith({ valid: true, user: payload });
    });

    it('retorna 401 cuando validateToken lanza error', async () => {
      vi.mocked(AuthService.validateToken).mockRejectedValue(new Error('Invalid or expired token'));

      const req = makeReq({ user: null });
      const res = makeRes();
      await AuthController.validate(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    });
  });

  describe('getProfile', () => {
    it('retorna 401 cuando no hay user en el request', async () => {
      const req = makeReq({ user: null });
      const res = makeRes();
      await AuthController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'User ID not found in token' });
    });

    it('retorna 401 cuando user existe pero no tiene id', async () => {
      const req = makeReq({ user: { email: 'x@x.com' } });
      const res = makeRes();
      await AuthController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('retorna 200 con el perfil del usuario', async () => {
      const profile = { usuario_id: 1, nombre: 'Juan' };
      vi.mocked(AuthService.getProfile).mockResolvedValue(profile);

      const req = makeReq({ user: { id: 1, email: 'a@b.com', role: 'docente' } });
      const res = makeRes();
      await AuthController.getProfile(req, res);

      expect(AuthService.getProfile).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(profile);
    });

    it('retorna 404 cuando el usuario no existe', async () => {
      vi.mocked(AuthService.getProfile).mockRejectedValue(new Error('User not found'));

      const req = makeReq({ user: { id: 99, email: 'a@b.com', role: 'docente' } });
      const res = makeRes();
      await AuthController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('retorna 500 ante error inesperado', async () => {
      vi.mocked(AuthService.getProfile).mockRejectedValue(new Error('DB error'));

      const req = makeReq({ user: { id: 1, email: 'a@b.com', role: 'docente' } });
      const res = makeRes();
      await AuthController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});
