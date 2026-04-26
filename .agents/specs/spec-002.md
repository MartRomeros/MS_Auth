- crea un directorio de servicios (services/) para manejar la logica de negocio de la aplicacion
- la logica de negocio no debe estar en los controladores

## Realizado

Se ha implementado la separación de responsabilidades siguiendo el patrón de diseño de servicios:

1.  **Directorio de Servicios**: Se creó la carpeta `src/services/` y el archivo `auth.service.ts`.
2.  **Encapsulamiento de Lógica**: Se trasladó toda la lógica de validación de credenciales, comparación de hashes y firma de tokens desde el controlador al servicio.
3.  **Refactorización de Controladores**: `AuthController` ahora solo maneja la comunicación HTTP, delegando el procesamiento de datos al `AuthService`.
4.  **Validación de Construcción**: Se verificó que el proyecto compila correctamente con `npm run build`, asegurando que la nueva estructura es funcional.

**Justificación**: Esta refactorización mejora la mantenibilidad y escalabilidad del microservicio. Al extraer la lógica de negocio de los controladores, facilitamos las pruebas unitarias y permitimos que la lógica de autenticación sea reutilizada por otros componentes sin depender del ciclo de vida de una petición HTTP de Express.

