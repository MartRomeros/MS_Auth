import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticateToken } from '../../src/middlewares/auth.middleware';
import * as jwtUtils from '../../src/utils/jwt';

vi.mock('../../src/utils/jwt', () => ({
  signToken: vi.fn(),
  verifyToken: vi.fn(),
}));

const makeRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides: object = {}): any => ({ headers: {}, ...overrides });

describe('authenticateToken middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 401 cuando un usuario no autorizado hace la petición sin token', () => {
    const req = makeReq({ headers: {} });
    const res = makeRes();
    const next = vi.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication token required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 401 cuando el header Authorization no trae el esquema Bearer', () => {
    const req = makeReq({ headers: { authorization: 'token-sin-bearer' } });
    const res = makeRes();
    const next = vi.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 403 cuando el token es inválido o expiró', () => {
    vi.mocked(jwtUtils.verifyToken).mockReturnValue(null);

    const req = makeReq({ headers: { authorization: 'Bearer token-invalido' } });
    const res = makeRes();
    const next = vi.fn();

    authenticateToken(req, res, next);

    expect(jwtUtils.verifyToken).toHaveBeenCalledWith('token-invalido');
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('llama a next() y asigna req.user cuando el token es válido', () => {
    const payload = { id: 1, email: 'a@b.com', role: 'docente' };
    vi.mocked(jwtUtils.verifyToken).mockReturnValue(payload as any);

    const req = makeReq({ headers: { authorization: 'Bearer token-valido' } });
    const res = makeRes();
    const next = vi.fn();

    authenticateToken(req, res, next);

    expect((req as any).user).toEqual(payload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
