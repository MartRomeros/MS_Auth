- Implementa zod para sustituir las validaciones manuales
- Utiliza esta herramienta donde sea necesario en el proyecto

Esto permitira generar tipos de typescript automaticamente a partir de los esquemas de zod

---
### Resumen de Trabajo Realizado:
- Se integró la librería **Zod** para la validación de esquemas.
- Se creó un **middleware de validación** centralizado para Express.
- Se definieron esquemas para `User`, `LoginInput` y `JWTPayload` con inferencia automática de tipos.
- Se sustituyeron las validaciones manuales en el controlador y servicios por validaciones basadas en esquemas.
- Se actualizaron los tests para verificar la correcta validación de entradas.

**Justificación:** Esta implementación mejora la seguridad del microservicio al garantizar que solo datos válidos lleguen a la lógica de negocio, a la vez que reduce el error humano mediante el tipado fuerte sincronizado con los esquemas de validación.