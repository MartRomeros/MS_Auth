import pool from '../config/database';

export interface TeacherDashboardSummaryRow {
    total_students: number;
    pending_evaluations: number;
    today_attendances: number;
    monthly_annotations: number;
}

export interface TeacherAssignmentRow {
    cad_id: number;
    course_id: number;
    course_name: string;
    subject_id: number;
    subject_name: string;
    subject_code: string | null;
    room_ids: number[];
}

export interface TeacherCourseStatsRow {
    course_id: number;
    course_name: string;
    attendance_count: number;
    general_average: number;
}

export class TeacherModel {
    static async getDashboardSummary(docenteId: number): Promise<TeacherDashboardSummaryRow | null> {
        const query = `
      WITH teacher_cad AS (
        SELECT id, curso_id
        FROM curso_asignatura_docente
        WHERE docente_id = $1
      ),
      teacher_courses AS (
        SELECT DISTINCT curso_id
        FROM teacher_cad
      )
      SELECT
        (
          SELECT COUNT(DISTINCT e.estudiante_id)
          FROM estudiantes e
          JOIN teacher_courses tc ON tc.curso_id = e.curso_id
        )::int AS total_students,
        (
          SELECT COUNT(DISTINCT ev.evaluacion_id)
          FROM evaluaciones ev
          JOIN teacher_cad tcad ON tcad.id = ev.cad_id
          WHERE ev.fecha_evaluacion >= CURRENT_DATE
        )::int AS pending_evaluations,
        (
          SELECT COUNT(DISTINCT a.asistencia_id)
          FROM asistencia a
          JOIN teacher_cad tcad ON tcad.id = a.cad_id
          WHERE a.fecha = CURRENT_DATE
        )::int AS today_attendances,
        (
          SELECT COUNT(DISTINCT an.anotacion_id)
          FROM anotaciones an
          WHERE an.docente_id = $1
            AND an.fecha_registro >= date_trunc('month', CURRENT_DATE)
            AND an.fecha_registro < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
        )::int AS monthly_annotations
    `;

        const result = await pool.query<TeacherDashboardSummaryRow>(query, [docenteId]);
        return result.rows[0] || null;
    }

    static async getTeacherAssignments(docenteId: number): Promise<TeacherAssignmentRow[]> {
        const query = `
      SELECT
        cad.id AS cad_id,
        c.curso_id AS course_id,
        CONCAT(c.nivel, ' ', c.letra) AS course_name,
        asig.asignatura_id AS subject_id,
        asig.nombre AS subject_name,
        asig.siglas AS subject_code,
        COALESCE(
          ARRAY_REMOVE(ARRAY_AGG(DISTINCT sea.sala_id), NULL),
          ARRAY[]::integer[]
        ) AS room_ids
      FROM curso_asignatura_docente cad
      JOIN cursos c ON c.curso_id = cad.curso_id
      JOIN asignaturas asig ON asig.asignatura_id = cad.asignatura_id
      LEFT JOIN evaluaciones ev ON ev.cad_id = cad.id
      LEFT JOIN asistencia a ON a.cad_id = cad.id
      LEFT JOIN sala_evaluacione_asistencia sea
        ON sea.evaluacion_id = ev.evaluacion_id
        OR sea.asistencia_id = a.asistencia_id
      WHERE cad.docente_id = $1
      GROUP BY
        cad.id,
        c.curso_id,
        c.nivel,
        c.letra,
        asig.asignatura_id,
        asig.nombre,
        asig.siglas
      ORDER BY course_name, subject_name
    `;

        const result = await pool.query<TeacherAssignmentRow>(query, [docenteId]);
        return result.rows;
    }

    static async getCourseStats(docenteId: number): Promise<TeacherCourseStatsRow[]> {
        const query = `
      WITH teacher_cad AS (
        SELECT id, curso_id
        FROM curso_asignatura_docente
        WHERE docente_id = $1
      ),
      teacher_courses AS (
        SELECT DISTINCT curso_id
        FROM teacher_cad
      ),
      attendance_by_course AS (
        SELECT
          tcad.curso_id,
          COUNT(DISTINCT a.asistencia_id)::int AS attendance_count
        FROM teacher_cad tcad
        JOIN asistencia a ON a.cad_id = tcad.id
        GROUP BY tcad.curso_id
      ),
      average_by_course AS (
        SELECT
          tcad.curso_id,
          ROUND(AVG(n.valor)::numeric, 2) AS general_average
        FROM teacher_cad tcad
        JOIN evaluaciones ev ON ev.cad_id = tcad.id
        JOIN notas n ON n.evaluacion_id = ev.evaluacion_id
        GROUP BY tcad.curso_id
      )
      SELECT
        c.curso_id AS course_id,
        CONCAT(c.nivel, ' ', c.letra) AS course_name,
        COALESCE(abc.attendance_count, 0)::int AS attendance_count,
        COALESCE(avgc.general_average, 0)::float AS general_average
      FROM teacher_courses tc
      JOIN cursos c ON c.curso_id = tc.curso_id
      LEFT JOIN attendance_by_course abc ON abc.curso_id = c.curso_id
      LEFT JOIN average_by_course avgc ON avgc.curso_id = c.curso_id
      ORDER BY course_name
    `;

        const result = await pool.query<TeacherCourseStatsRow>(query, [docenteId]);
        return result.rows;
    }
}