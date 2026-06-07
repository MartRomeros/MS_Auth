import pool from '../config/database';

export interface AdminDashboardSummaryRow {
  cantidad_estudiantes: number | null;
  cantidad_docentes: number | null;
  porcentaje_asistencia: number | null;
  cantidad_cursos: number | null;
}

export class AdminModel {
  static async existsActiveAdmin(adminId: number): Promise<boolean> {
    const query = `
      SELECT 1
      FROM usuarios u
      JOIN roles r ON r.rol_id = u.rol_id
      WHERE u.usuario_id = $1
        AND u.activo = true
        AND LOWER(r.nombre) = 'administrador'
      LIMIT 1
    `;

    const result = await pool.query(query, [adminId]);
    return result.rows.length > 0;
  }

  static async getDashboardSummary(): Promise<AdminDashboardSummaryRow | null> {
    const query = `
      WITH students_count AS (
        SELECT COUNT(*)::int AS cantidad_estudiantes
        FROM estudiantes e
        JOIN usuarios u ON u.usuario_id = e.estudiante_id
        WHERE u.activo = true
      ),
      teachers_count AS (
        SELECT COUNT(*)::int AS cantidad_docentes
        FROM docentes d
        JOIN usuarios u ON u.usuario_id = d.docente_id
        WHERE u.activo = true
      ),
      courses_count AS (
        SELECT COUNT(*)::int AS cantidad_cursos
        FROM cursos
      ),
      attendance_ratio AS (
        SELECT
          CASE
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND(
              (SUM(CASE WHEN LOWER(a.estado) IN ('presente', 'p', 'present') THEN 1 ELSE 0 END)::numeric
              / COUNT(*)::numeric) * 100
            )::int
          END AS porcentaje_asistencia
        FROM asistencia a
      )
      SELECT
        COALESCE((SELECT cantidad_estudiantes FROM students_count), 0)::int AS cantidad_estudiantes,
        COALESCE((SELECT cantidad_docentes FROM teachers_count), 0)::int AS cantidad_docentes,
        COALESCE((SELECT porcentaje_asistencia FROM attendance_ratio), 0)::int AS porcentaje_asistencia,
        COALESCE((SELECT cantidad_cursos FROM courses_count), 0)::int AS cantidad_cursos
    `;

    const result = await pool.query<AdminDashboardSummaryRow>(query);
    return result.rows[0] || null;
  }
}