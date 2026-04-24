import pool from '../config/database';

export interface User {
  usuario_id: number;
  email: string;
  password?: string;
  rol_nombre: string;
}

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
}
