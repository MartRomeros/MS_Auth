- generar la funcionalidad para rescatar datos del usuario
- servira para mostrar datos del usuario en el frontend especificamente su perfil.
- el endpoint debe estar protegido por token, es decir, debe validar el token antes de retornar los datos del usuario. (middleware)
- si el token es valido, debe retornar los datos del usuario.


modelo indicado

```typescript

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
```

---

### Tarea Realizada
**Justificación y Detalles de Implementación:**
Se implementó el endpoint protegido `/api/auth/profile` para rescatar los datos completos del usuario:
1. **Modelos y Tipos (`src/models/user.profile.ts`)**: Se agregaron las interfaces TypeScript proporcionadas en el spec para el perfilado fuerte de datos.
2. **Consultas a Base de Datos (`src/models/user.model.ts`)**: Se creó el método `findProfileById` en `UserModel` que obtiene los datos base del usuario haciendo un JOIN con la tabla de `roles`. Luego, de acuerdo al rol del usuario, realiza consultas específicas adicionales a las tablas de `estudiantes`, `docentes` o `apoderados` según corresponda para armar el objeto completo.
3. **Servicio (`src/services/auth.service.ts`)**: Se implementó `getProfile` que solicita los datos de perfil al modelo y arroja un error si el usuario no existe.
4. **Controlador (`src/controllers/auth.controller.ts`)**: Se añadió el método `getProfile` para gestionar las peticiones web, obteniendo el `id` desde el token ya desencriptado en `req.user`.
5. **Rutas (`src/routes/auth.routes.ts`)**: Se registró el endpoint `GET /profile`, utilizando el middleware preexistente `authenticateToken` para asegurar su protección mediante JWT, tal como se requería.