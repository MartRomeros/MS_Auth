/**
 * Perfil completo del usuario según el esquema de base de datos.
 * No incluye el campo `password`.
 */
export interface UserProfile {
  usuario_id: number;
  rut: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  email: string;
  activo: boolean;
  rol: UserRole;
  /** Datos extra según el tipo de usuario */
  datosEspecificos?: EstudiantePerfil | DocentePerfil | ApoderadoPerfil;
}

export interface UserRole {
  rol_id: number;
  nombre: string;
}

export interface EstudiantePerfil {
  tipo: 'estudiante';
  curso?: CursoPerfil;
}

export interface DocentePerfil {
  tipo: 'docente';
  especialidad?: string;
}

export interface ApoderadoPerfil {
  tipo: 'apoderado';
}

export interface CursoPerfil {
  curso_id: number;
  nivel: string;
  letra: string;
  anio_academico: number;
}
