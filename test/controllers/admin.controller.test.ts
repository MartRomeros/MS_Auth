import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminController } from '../../src/controllers/admin.controller';
import { AdminService } from '../../src/services/admin.service';

vi.mock('../../src/services/admin.service', () => ({
  AdminService: {
    getDashboard: vi.fn(),
  },
}));

const makeRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides: object = {}): any => ({ ...overrides });

const mockDashboard = {
  cantidadEstudiantes: 10,
  cantidadDocentes: 5,
  porcentajeAsistencia: 85,
  cantidadCursos: 4,
};

describe('AdminController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('retorna 401 cuando no hay user en el request', async () => {
      const req = makeReq({ user: undefined });
      const res = makeRes();
      await AdminController.getDashboard(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'User ID not found in token' });
    });

    it('retorna 401 cuando user.id no es número', async () => {
      const req = makeReq({ user: { id: '1', role: 'administrador' } });
      const res = makeRes();
      await AdminController.getDashboard(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('retorna 403 cuando el rol no es administrador', async () => {
      const req = makeReq({ user: { id: 1, role: 'docente' } });
      const res = makeRes();
      await AdminController.getDashboard(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: admin role required' });
    });

    it('retorna 403 para rol en mayúsculas distintas a administrador', async () => {
      const req = makeReq({ user: { id: 1, role: 'Administrador' } });
      const res = makeRes();

      vi.mocked(AdminService.getDashboard).mockResolvedValue(mockDashboard);
      await AdminController.getDashboard(req, res);

      expect(res.json).toHaveBeenCalledWith(mockDashboard);
    });

    it('retorna 404 cuando el admin no se encuentra', async () => {
      vi.mocked(AdminService.getDashboard).mockRejectedValue(new Error('ADMIN_NOT_FOUND'));

      const req = makeReq({ user: { id: 99, role: 'administrador' } });
      const res = makeRes();
      await AdminController.getDashboard(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Admin not found' });
    });

    it('retorna 200 con los datos del dashboard', async () => {
      vi.mocked(AdminService.getDashboard).mockResolvedValue(mockDashboard);

      const req = makeReq({ user: { id: 1, role: 'administrador' } });
      const res = makeRes();
      await AdminController.getDashboard(req, res);

      expect(AdminService.getDashboard).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockDashboard);
    });

    it('retorna 500 ante error inesperado', async () => {
      vi.mocked(AdminService.getDashboard).mockRejectedValue(new Error('DB error'));

      const req = makeReq({ user: { id: 1, role: 'administrador' } });
      const res = makeRes();
      await AdminController.getDashboard(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});
