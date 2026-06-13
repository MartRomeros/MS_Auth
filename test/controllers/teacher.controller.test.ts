import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeacherController } from '../../src/controllers/teacher.controller';
import { TeacherService } from '../../src/services/teacher.service';

vi.mock('../../src/services/teacher.service', () => ({
  TeacherService: {
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
  summary: {
    totalStudents: 30,
    pendingEvaluations: 3,
    todayAttendances: 28,
    monthlyAnnotations: 5,
  },
  assignments: [],
  courses: [],
};

describe('TeacherController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('retorna 401 cuando no hay user en el request', async () => {
      const req = makeReq({ user: undefined });
      const res = makeRes();
      await TeacherController.getDashboard(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'User ID not found in token' });
    });

    it('retorna 401 cuando user.id no es número', async () => {
      const req = makeReq({ user: { id: '5', role: 'docente' } });
      const res = makeRes();
      await TeacherController.getDashboard(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('retorna 403 cuando el rol no es docente', async () => {
      const req = makeReq({ user: { id: 1, role: 'estudiante' } });
      const res = makeRes();
      await TeacherController.getDashboard(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: teacher role required' });
    });

    it('retorna 403 para administrador intentando acceder a ruta de docente', async () => {
      const req = makeReq({ user: { id: 1, role: 'administrador' } });
      const res = makeRes();
      await TeacherController.getDashboard(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('retorna 200 con los datos del dashboard', async () => {
      vi.mocked(TeacherService.getDashboard).mockResolvedValue(mockDashboard);

      const req = makeReq({ user: { id: 1, role: 'docente' } });
      const res = makeRes();
      await TeacherController.getDashboard(req, res);

      expect(TeacherService.getDashboard).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockDashboard);
    });

    it('retorna 200 con rol en mayúsculas mezcladas', async () => {
      vi.mocked(TeacherService.getDashboard).mockResolvedValue(mockDashboard);

      const req = makeReq({ user: { id: 1, role: 'Docente' } });
      const res = makeRes();
      await TeacherController.getDashboard(req, res);

      expect(res.json).toHaveBeenCalledWith(mockDashboard);
    });

    it('retorna 500 ante error inesperado', async () => {
      vi.mocked(TeacherService.getDashboard).mockRejectedValue(new Error('DB error'));

      const req = makeReq({ user: { id: 1, role: 'docente' } });
      const res = makeRes();
      await TeacherController.getDashboard(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});
