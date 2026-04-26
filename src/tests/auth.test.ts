import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';
import { UserModel } from '../models/user.model';

// Mock del UserModel para no usar la base de datos real
vi.mock('../models/user.model', () => ({
  UserModel: {
    findByEmail: vi.fn(),
  },
}));

describe('Auth Controller - Login', () => {
  it('should return 401 if user does not exist', async () => {
    // Simulamos que el usuario no existe
    (UserModel.findByEmail as any).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@test.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should return 400 if validation fails', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'invalid-email', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Validation failed');
    expect(res.body).toHaveProperty('errors');
  });

  it('Debe devolver 200 si el usuario existe y la contraseña es correcta')
});
