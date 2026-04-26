import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Health Check', () => {
  it('should return status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'UP' });
  });

  it('should serve Swagger docs', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(200);
  });
});
