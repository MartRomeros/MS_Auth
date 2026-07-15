import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import * as jwtUtils from '../../src/utils/jwt';
import { AdminService } from '../../src/services/admin.service';

vi.mock('../../src/utils/jwt', () => ({
  signToken: vi.fn(),
  verifyToken: vi.fn(),
}));

vi.mock('../../src/services/admin.service', () => ({
  AdminService: {
    getDashboard: vi.fn(),
  },
}));

describe('GET /api/admin/me/dashboard (integración - autorización)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 401 cuando un usuario no autorizado hace la petición sin token', async () => {
    const res = await request(app).get('/api/admin/me/dashboard');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Authentication token required' });
    expect(AdminService.getDashboard).not.toHaveBeenCalled();
  });

  it('retorna 403 cuando el token enviado es inválido o expiró', async () => {
    vi.mocked(jwtUtils.verifyToken).mockReturnValue(null);

    const res = await request(app)
      .get('/api/admin/me/dashboard')
      .set('Authorization', 'Bearer token-falso');

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: 'Invalid or expired token' });
    expect(AdminService.getDashboard).not.toHaveBeenCalled();
  });

  it('retorna 403 cuando un usuario autenticado sin rol admin intenta acceder', async () => {
    vi.mocked(jwtUtils.verifyToken).mockReturnValue({
      id: 5,
      email: 'docente@test.com',
      role: 'docente',
    } as any);

    const res = await request(app)
      .get('/api/admin/me/dashboard')
      .set('Authorization', 'Bearer token-de-docente');

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: 'Forbidden: admin role required' });
    expect(AdminService.getDashboard).not.toHaveBeenCalled();
  });
});
