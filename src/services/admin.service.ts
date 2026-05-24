import { AdminDashboardSummaryRow, AdminModel } from '../models/admin.model';

export interface AdminDashboardSummary {
  cantidadEstudiantes: number;
  cantidadDocentes: number;
  porcentajeAsistencia: number;
  cantidadCursos: number;
}

export class AdminService {
  static async getDashboard(adminId: number): Promise<AdminDashboardSummary> {
    const exists = await AdminModel.existsActiveAdmin(adminId);

    if (!exists) {
      throw new Error('ADMIN_NOT_FOUND');
    }

    const summary = await AdminModel.getDashboardSummary();
    return AdminService.mapSummary(summary);
  }

  private static mapSummary(summary: AdminDashboardSummaryRow | null): AdminDashboardSummary {
    return {
      cantidadEstudiantes: Number(summary?.cantidad_estudiantes ?? 0),
      cantidadDocentes: Number(summary?.cantidad_docentes ?? 0),
      porcentajeAsistencia: Number(summary?.porcentaje_asistencia ?? 0),
      cantidadCursos: Number(summary?.cantidad_cursos ?? 0),
    };
  }
}

