import pool from '../config/database';

export interface StudentDashboardSummaryRow {
  promedio_general: number | null;
  asistencia_global: number | null;
  recursos_disponibles: number | null;
  mensajes_pendientes: number | null;
}

export class StudentModel {
  static async existsActiveStudent(studentId: number): Promise<boolean> {
    const query = `
      SELECT 1
      FROM estudiantes e
      JOIN usuarios u ON u.usuario_id = e.estudiante_id
      JOIN roles r ON r.rol_id = u.rol_id
      WHERE e.estudiante_id = $1
        AND u.activo = true
        AND LOWER(r.nombre) = 'estudiante'
      LIMIT 1
    `;

    const result = await pool.query(query, [studentId]);
    return result.rows.length > 0;
  }

  static async getDashboardSummary(studentId: number): Promise<StudentDashboardSummaryRow | null> {
    const query = `
      WITH student_context AS (
        SELECT u.usuario_id, u.email, u.rut
        FROM usuarios u
        WHERE u.usuario_id = $1
      ),
      grades AS (
        SELECT ROUND(AVG(n.valor)::numeric, 1)::float AS promedio_general
        FROM notas n
        WHERE n.estudiante_id = $1
      ),
      attendance AS (
        SELECT
          CASE
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND(
              (SUM(CASE WHEN LOWER(a.estado) IN ('presente', 'p', 'present') THEN 1 ELSE 0 END)::numeric
              / COUNT(*)::numeric) * 100
            )::int
          END AS asistencia_global
        FROM asistencia a
        WHERE a.estudiante_id = $1
      ),
      messages AS (
        SELECT COUNT(*)::int AS mensajes_pendientes
        FROM mensajeria m
        JOIN student_context sc ON true
        WHERE COALESCE(m.leido, false) = false
          AND LOWER(TRIM(m.quien_recibe)) IN (LOWER(TRIM(sc.email)), LOWER(TRIM(sc.rut)))
      )
      SELECT
        COALESCE((SELECT promedio_general FROM grades), 0)::float AS promedio_general,
        COALESCE((SELECT asistencia_global FROM attendance), 0)::int AS asistencia_global,
        0::int AS recursos_disponibles,
        COALESCE((SELECT mensajes_pendientes FROM messages), 0)::int AS mensajes_pendientes
    `;

    const result = await pool.query<StudentDashboardSummaryRow>(query, [studentId]);
    return result.rows[0] || null;
  }
}