import {
  TeacherAssignmentRow,
  TeacherCourseStatsRow,
  TeacherDashboardSummaryRow,
  TeacherModel,
} from '../models/teacher.model';

export interface TeacherDashboardSummary {
  totalStudents: number;
  pendingEvaluations: number;
  todayAttendances: number;
  monthlyAnnotations: number;
}

export interface TeacherAssignment {
  cadId: number;
  courseId: number;
  courseName: string;
  subjectId: number;
  subjectName: string;
  subjectCode: string | null;
  roomIds: number[];
}

export interface TeacherCourseStats {
  courseId: number;
  courseName: string;
  attendanceCount: number;
  generalAverage: number;
}

export interface TeacherDashboard {
  summary: TeacherDashboardSummary;
  assignments: TeacherAssignment[];
  courses: TeacherCourseStats[];
}

export class TeacherService {
  static async getDashboard(docenteId: number): Promise<TeacherDashboard> {
    const [summary, assignments, courses] = await Promise.all([
      TeacherModel.getDashboardSummary(docenteId),
      TeacherModel.getTeacherAssignments(docenteId),
      TeacherModel.getCourseStats(docenteId),
    ]);

    return {
      summary: TeacherService.mapSummary(summary),
      assignments: assignments.map(TeacherService.mapAssignment),
      courses: courses.map(TeacherService.mapCourseStats),
    };
  }

  private static mapSummary(summary: TeacherDashboardSummaryRow | null): TeacherDashboardSummary {
    return {
      totalStudents: Number(summary?.total_students ?? 0),
      pendingEvaluations: Number(summary?.pending_evaluations ?? 0),
      todayAttendances: Number(summary?.today_attendances ?? 0),
      monthlyAnnotations: Number(summary?.monthly_annotations ?? 0),
    };
  }

  private static mapAssignment(row: TeacherAssignmentRow): TeacherAssignment {
    return {
      cadId: Number(row.cad_id),
      courseId: Number(row.course_id),
      courseName: row.course_name,
      subjectId: Number(row.subject_id),
      subjectName: row.subject_name,
      subjectCode: row.subject_code,
      roomIds: Array.isArray(row.room_ids) ? row.room_ids.map(Number) : [],
    };
  }

  private static mapCourseStats(row: TeacherCourseStatsRow): TeacherCourseStats {
    return {
      courseId: Number(row.course_id),
      courseName: row.course_name,
      attendanceCount: Number(row.attendance_count ?? 0),
      generalAverage: Number(row.general_average ?? 0),
    };
  }
}

