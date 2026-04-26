- Genera un login y validacion del token firmado con una expiracion de 2 hora.
- El token debe contener el id, email, y el role
- El SALT de bcrypt debe ser 12

## Realizado

Se ha implementado el núcleo de autenticación del microservicio siguiendo las especificaciones del Spec-001:

1.  **Configuración de Base de Datos**: Se configuró un pool de conexiones con `pg` en `src/config/database.ts` utilizando variables de entorno para mayor seguridad y flexibilidad.
2.  **Utilidades de Seguridad**:
    *   `src/utils/jwt.ts`: Implementa la firma de tokens con una expiración de 2 horas y una carga útil que incluye `id`, `email` y `role`.
    *   `src/utils/bcrypt.ts`: Configura el hashing de contraseñas con un `SALT_ROUNDS` de 12, garantizando el cumplimiento del estándar de seguridad solicitado.
3.  **Modelo de Usuario**: Se creó `src/models/user.model.ts` con un método para buscar usuarios por email, realizando un `JOIN` con la tabla `roles` para obtener el nombre del rol necesario para el token.
4.  **Controlador de Autenticación**: `src/controllers/auth.controller.ts` maneja la lógica de:
    *   `login`: Valida credenciales, compara hashes y genera el JWT.
    *   `validate`: Endpoint para verificar la validez de un token existente.
5.  **Rutas y Middleware**:
    *   Se definieron las rutas en `src/routes/auth.routes.ts` bajo el prefijo `/api/auth`.
    *   Se implementó `src/middlewares/auth.middleware.ts` para proteger futuras rutas que requieran autenticación.
6.  **Integración**: Se registraron las rutas en `src/app.ts` y se verificó la compilación exitosa del proyecto con `tsc`.

**Justificación**: La separación en capas (Config, Models, Controllers, Routes, Utils, Middlewares) asegura un código mantenible, escalable y fácil de testear, cumpliendo estrictamente con los requisitos de seguridad y rendimiento establecidos.
