import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { UserModel } from '../../src/models/user.model';

vi.mock('../../src/models/user.model', () => ({
  UserModel: {
    findByEmail: vi.fn(),
    findProfileById: vi.fn(),
  },
}));

describe('POST /api/auth/login (integración)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 401 cuando un usuario no registrado intenta hacer login', async () => {
    vi.mocked(UserModel.findByEmail).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'no-registrado@test.com', password: 'cualquierPass' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid credentials' });
    expect(UserModel.findByEmail).toHaveBeenCalledWith('no-registrado@test.com');
    expect(UserModel.findProfileById).not.toHaveBeenCalled();
  });

  it('retorna 400 y no consulta la BD cuando el email tiene formato inválido', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'esto-no-es-un-email', password: 'cualquierPass' });

    expect(res.status).toBe(400);
    expect(UserModel.findByEmail).not.toHaveBeenCalled();
  });
});
