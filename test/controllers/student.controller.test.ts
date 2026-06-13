import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudentController } from '../../src/controllers/student.controller';
import { StudentService } from '../../src/services/student.service';

vi.mock('../../src/services/student.service', () => ({
  StudentService: {
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
  promedioGeneral: 5.8,
  asistenciaGlobal: 92,
  recursosDisponibles: 0,
  mensajesPendientes: 2,
};

describe('StudentController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('retorna 401 cuando no hay user en el request', async () => {
      const req = makeReq({ user: undefined });
      const res = makeRes();
      await StudentController.getDashboard(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'User ID not found in token' });
    });

    it('retorna 401 cuando user.id no es número', async () => {
      const req = makeReq({ user: { id: '1', role: 'estudiante' } });
      const res = makeRes();
      await StudentController.getDashboard(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('retorna 403 cuando el rol no es estudiante', async () => {
      const req = makeReq({ user: { id: 1, role: 'docente' } });
      const res = makeRes();
      await StudentController.getDashboard(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: student role required' });
    });

    it('retorna 403 para administrador intentando acceder a ruta de estudiante', async () => {
      const req = makeReq({ user: { id: 1, role: 'administrador' } });
      const res = makeRes();
      await StudentController.getDashboard(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('retorna 404 cuando el estudiante no se encuentra', async () => {
      vi.mocked(StudentService.getDashboard).mockRejectedValue(new Error('STUDENT_NOT_FOUND'));

      const req = makeReq({ user: { id: 99, role: 'estudiante' } });
      const res = makeRes();
      await StudentController.getDashboard(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Student not found' });
    });

    it('retorna 200 con los datos del dashboard', async () => {
      vi.mocked(StudentService.getDashboard).mockResolvedValue(mockDashboard);

      const req = makeReq({ user: { id: 1, role: 'estudiante' } });
      const res = makeRes();
      await StudentController.getDashboard(req, res);

      expect(StudentService.getDashboard).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockDashboard);
    });

    it('retorna 200 con rol en mayúsculas mezcladas', async () => {
      vi.mocked(StudentService.getDashboard).mockResolvedValue(mockDashboard);

      const req = makeReq({ user: { id: 1, role: 'Estudiante' } });
      const res = makeRes();
      await StudentController.getDashboard(req, res);

      expect(res.json).toHaveBeenCalledWith(mockDashboard);
    });

    it('retorna 500 ante error inesperado', async () => {
      vi.mocked(StudentService.getDashboard).mockRejectedValue(new Error('DB error'));

      const req = makeReq({ user: { id: 1, role: 'estudiante' } });
      const res = makeRes();
      await StudentController.getDashboard(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});
