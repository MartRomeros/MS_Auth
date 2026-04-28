import pool from '../config/database';

import { User } from '../schemas/user.schema';

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT u.usuario_id, u.email, u.password, r.nombre as rol_nombre
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.rol_id
      WHERE u.email = $1 AND u.activo = true
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findProfileById(usuarioId: number): Promise<any> {
    const query = `
      SELECT 
        u.usuario_id, u.rut, u.nombre, u.apellido_paterno, u.apellido_materno, u.email, u.activo,
        r.rol_id, r.nombre as rol_nombre
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.rol_id
      WHERE u.usuario_id = $1 AND u.activo = true
    `;
    const result = await pool.query(query, [usuarioId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const baseUser = result.rows[0];
    
    let profile: any = {
      usuario_id: baseUser.usuario_id,
      rut: baseUser.rut,
      nombre: baseUser.nombre,
      apellido_paterno: baseUser.apellido_paterno,
      apellido_materno: baseUser.apellido_materno,
      email: baseUser.email,
      activo: baseUser.activo,
      rol: {
        rol_id: baseUser.rol_id,
        nombre: baseUser.rol_nombre
      }
    };

    // Obtener datos específicos según rol
    const rolNombre = baseUser.rol_nombre.toLowerCase();

    if (rolNombre === 'estudiante') {
      const estQuery = `
        SELECT c.curso_id, c.nivel, c.letra, c.anio_academico
        FROM estudiantes e
        LEFT JOIN cursos c ON e.curso_id = c.curso_id
        WHERE e.estudiante_id = $1
      `;
      const estResult = await pool.query(estQuery, [usuarioId]);
      
      if (estResult.rows.length > 0) {
        const estData = estResult.rows[0];
        profile.datosEspecificos = {
          tipo: 'estudiante',
          curso: estData.curso_id ? {
            curso_id: estData.curso_id,
            nivel: estData.nivel,
            letra: estData.letra,
            anio_academico: estData.anio_academico
          } : undefined
        };
      }
    } else if (rolNombre === 'docente') {
      const docQuery = `
        SELECT especialidad
        FROM docentes
        WHERE docente_id = $1
      `;
      const docResult = await pool.query(docQuery, [usuarioId]);
      
      if (docResult.rows.length > 0) {
        profile.datosEspecificos = {
          tipo: 'docente',
          especialidad: docResult.rows[0].especialidad
        };
      }
    } else if (rolNombre === 'apoderado') {
      const apoQuery = `
        SELECT 1
        FROM apoderados
        WHERE apoderado_id = $1
      `;
      const apoResult = await pool.query(apoQuery, [usuarioId]);
      
      if (apoResult.rows.length > 0) {
        profile.datosEspecificos = {
          tipo: 'apoderado'
        };
      }
    }

    return profile;
  }
}
