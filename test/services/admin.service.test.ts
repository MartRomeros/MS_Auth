import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminService } from '../../src/services/admin.service';
import { AdminModel } from '../../src/models/admin.model';

vi.mock('../../src/models/admin.model', () => ({
  AdminModel: {
    existsActiveAdmin: vi.fn(),
    getDashboardSummary: vi.fn(),
  },
}));

describe('AdminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('lanza ADMIN_NOT_FOUND cuando el admin no existe', async () => {
      vi.mocked(AdminModel.existsActiveAdmin).mockResolvedValue(false);

      await expect(AdminService.getDashboard(99)).rejects.toThrow('ADMIN_NOT_FOUND');
      expect(AdminModel.getDashboardSummary).not.toHaveBeenCalled();
    });

    it('retorna el resumen mapeado para un admin existente', async () => {
      vi.mocked(AdminModel.existsActiveAdmin).mockResolvedValue(true);
      vi.mocked(AdminModel.getDashboardSummary).mockResolvedValue({
        cantidad_estudiantes: 10,
        cantidad_docentes: 5,
        porcentaje_asistencia: 85,
        cantidad_cursos: 4,
      });

      const result = await AdminService.getDashboard(1);

      expect(result).toEqual({
        cantidadEstudiantes: 10,
        cantidadDocentes: 5,
        porcentajeAsistencia: 85,
        cantidadCursos: 4,
      });
    });

    it('mapea valores null del resumen a 0', async () => {
      vi.mocked(AdminModel.existsActiveAdmin).mockResolvedValue(true);
      vi.mocked(AdminModel.getDashboardSummary).mockResolvedValue(null);

      const result = await AdminService.getDashboard(1);

      expect(result).toEqual({
        cantidadEstudiantes: 0,
        cantidadDocentes: 0,
        porcentajeAsistencia: 0,
        cantidadCursos: 0,
      });
    });

    it('mapea campos null individuales a 0', async () => {
      vi.mocked(AdminModel.existsActiveAdmin).mockResolvedValue(true);
      vi.mocked(AdminModel.getDashboardSummary).mockResolvedValue({
        cantidad_estudiantes: null,
        cantidad_docentes: 3,
        porcentaje_asistencia: null,
        cantidad_cursos: 2,
      });

      const result = await AdminService.getDashboard(1);

      expect(result.cantidadEstudiantes).toBe(0);
      expect(result.cantidadDocentes).toBe(3);
      expect(result.porcentajeAsistencia).toBe(0);
      expect(result.cantidadCursos).toBe(2);
    });
  });
});
