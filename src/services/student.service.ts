import { StudentDashboardSummaryRow, StudentModel } from '../models/student.model';

export interface StudentDashboardSummary {
  promedioGeneral: number;
  asistenciaGlobal: number;
  recursosDisponibles: number;
  mensajesPendientes: number;
}

export class StudentService {
  static async getDashboard(studentId: number): Promise<StudentDashboardSummary> {
    const exists = await StudentModel.existsActiveStudent(studentId);

    if (!exists) {
      throw new Error('STUDENT_NOT_FOUND');
    }

    const summary = await StudentModel.getDashboardSummary(studentId);
    return StudentService.mapSummary(summary);
  }

  private static mapSummary(summary: StudentDashboardSummaryRow | null): StudentDashboardSummary {
    return {
      promedioGeneral: Number(summary?.promedio_general ?? 0),
      asistenciaGlobal: Number(summary?.asistencia_global ?? 0),
      recursosDisponibles: Number(summary?.recursos_disponibles ?? 0),
      mensajesPendientes: Number(summary?.mensajes_pendientes ?? 0),
    };
  }
}