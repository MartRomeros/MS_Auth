import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudentService } from '../../src/services/student.service';
import { StudentModel } from '../../src/models/student.model';

vi.mock('../../src/models/student.model', () => ({
  StudentModel: {
    existsActiveStudent: vi.fn(),
    getDashboardSummary: vi.fn(),
  },
}));

describe('StudentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('lanza STUDENT_NOT_FOUND cuando el estudiante no existe', async () => {
      vi.mocked(StudentModel.existsActiveStudent).mockResolvedValue(false);

      await expect(StudentService.getDashboard(99)).rejects.toThrow('STUDENT_NOT_FOUND');
      expect(StudentModel.getDashboardSummary).not.toHaveBeenCalled();
    });

    it('retorna el resumen mapeado para un estudiante existente', async () => {
      vi.mocked(StudentModel.existsActiveStudent).mockResolvedValue(true);
      vi.mocked(StudentModel.getDashboardSummary).mockResolvedValue({
        promedio_general: 5.8,
        asistencia_global: 92,
        recursos_disponibles: 3,
        mensajes_pendientes: 2,
      });

      const result = await StudentService.getDashboard(1);

      expect(result).toEqual({
        promedioGeneral: 5.8,
        asistenciaGlobal: 92,
        recursosDisponibles: 3,
        mensajesPendientes: 2,
      });
    });

    it('mapea resumen null completamente a ceros', async () => {
      vi.mocked(StudentModel.existsActiveStudent).mockResolvedValue(true);
      vi.mocked(StudentModel.getDashboardSummary).mockResolvedValue(null);

      const result = await StudentService.getDashboard(1);

      expect(result).toEqual({
        promedioGeneral: 0,
        asistenciaGlobal: 0,
        recursosDisponibles: 0,
        mensajesPendientes: 0,
      });
    });

    it('mapea campos null individuales a 0', async () => {
      vi.mocked(StudentModel.existsActiveStudent).mockResolvedValue(true);
      vi.mocked(StudentModel.getDashboardSummary).mockResolvedValue({
        promedio_general: null,
        asistencia_global: 90,
        recursos_disponibles: null,
        mensajes_pendientes: 1,
      });

      const result = await StudentService.getDashboard(1);

      expect(result.promedioGeneral).toBe(0);
      expect(result.asistenciaGlobal).toBe(90);
      expect(result.recursosDisponibles).toBe(0);
      expect(result.mensajesPendientes).toBe(1);
    });
  });
});
