import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeacherService } from '../../src/services/teacher.service';
import { TeacherModel } from '../../src/models/teacher.model';

vi.mock('../../src/models/teacher.model', () => ({
  TeacherModel: {
    getDashboardSummary: vi.fn(),
    getTeacherAssignments: vi.fn(),
    getCourseStats: vi.fn(),
  },
}));

const mockSummaryRow = {
  total_students: 30,
  pending_evaluations: 3,
  today_attendances: 28,
  monthly_annotations: 5,
};

const mockAssignmentRow = {
  cad_id: 1,
  course_id: 2,
  course_name: '1° A',
  subject_id: 3,
  subject_name: 'Matemáticas',
  subject_code: 'MAT',
  sala_id: 4,
  sala_nombre: 'Sala 101',
};

const mockCourseStatsRow = {
  course_id: 2,
  course_name: '1° A',
  attendance_count: 28,
  general_average: 5.5,
};

describe('TeacherService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('retorna dashboard completamente mapeado', async () => {
      vi.mocked(TeacherModel.getDashboardSummary).mockResolvedValue(mockSummaryRow);
      vi.mocked(TeacherModel.getTeacherAssignments).mockResolvedValue([mockAssignmentRow]);
      vi.mocked(TeacherModel.getCourseStats).mockResolvedValue([mockCourseStatsRow]);

      const result = await TeacherService.getDashboard(1);

      expect(result.summary).toEqual({
        totalStudents: 30,
        pendingEvaluations: 3,
        todayAttendances: 28,
        monthlyAnnotations: 5,
      });

      expect(result.assignments).toEqual([
        {
          cadId: 1,
          courseId: 2,
          courseName: '1° A',
          subjectId: 3,
          subjectName: 'Matemáticas',
          subjectCode: 'MAT',
          sala: { id: 4, nombre: 'Sala 101' },
        },
      ]);

      expect(result.courses).toEqual([
        {
          courseId: 2,
          courseName: '1° A',
          attendanceCount: 28,
          generalAverage: 5.5,
        },
      ]);
    });

    it('mapea sala_id null a sala: null en assignments', async () => {
      vi.mocked(TeacherModel.getDashboardSummary).mockResolvedValue(null);
      vi.mocked(TeacherModel.getTeacherAssignments).mockResolvedValue([
        { ...mockAssignmentRow, sala_id: null, sala_nombre: null },
      ]);
      vi.mocked(TeacherModel.getCourseStats).mockResolvedValue([]);

      const result = await TeacherService.getDashboard(1);

      expect(result.assignments[0]?.sala).toBeNull();
    });

    it('retorna summary con ceros cuando getDashboardSummary retorna null', async () => {
      vi.mocked(TeacherModel.getDashboardSummary).mockResolvedValue(null);
      vi.mocked(TeacherModel.getTeacherAssignments).mockResolvedValue([]);
      vi.mocked(TeacherModel.getCourseStats).mockResolvedValue([]);

      const result = await TeacherService.getDashboard(1);

      expect(result.summary).toEqual({
        totalStudents: 0,
        pendingEvaluations: 0,
        todayAttendances: 0,
        monthlyAnnotations: 0,
      });
    });

    it('retorna arreglos vacíos cuando no hay asignaciones ni cursos', async () => {
      vi.mocked(TeacherModel.getDashboardSummary).mockResolvedValue(mockSummaryRow);
      vi.mocked(TeacherModel.getTeacherAssignments).mockResolvedValue([]);
      vi.mocked(TeacherModel.getCourseStats).mockResolvedValue([]);

      const result = await TeacherService.getDashboard(1);

      expect(result.assignments).toEqual([]);
      expect(result.courses).toEqual([]);
    });

    it('ejecuta las tres consultas en paralelo (Promise.all)', async () => {
      vi.mocked(TeacherModel.getDashboardSummary).mockResolvedValue(mockSummaryRow);
      vi.mocked(TeacherModel.getTeacherAssignments).mockResolvedValue([]);
      vi.mocked(TeacherModel.getCourseStats).mockResolvedValue([]);

      await TeacherService.getDashboard(5);

      expect(TeacherModel.getDashboardSummary).toHaveBeenCalledWith(5);
      expect(TeacherModel.getTeacherAssignments).toHaveBeenCalledWith(5);
      expect(TeacherModel.getCourseStats).toHaveBeenCalledWith(5);
    });
  });
});
