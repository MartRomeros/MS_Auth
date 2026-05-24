# Tasks: Dashboard de Estudiante

## Task 1: Validar esquema disponible
- Objetivo: ubicar y revisar `script.sql` para confirmar si los cuatro indicadores son calculables.
- Archivos esperados: `script.sql` o documento de hallazgos dentro del spec si el archivo no existe.
- Tests requeridos: no aplica.
- Criterio de finalizacion: quedan identificadas tablas, columnas y relaciones para notas, asistencia, recursos y mensajes; si falta alguna fuente, queda documentado como bloqueo.

## Task 2: Definir modelo de datos del dashboard
- Objetivo: crear las interfaces de filas SQL y respuesta publica del dashboard estudiante.
- Archivos esperados: `src/models/student.model.ts`, `src/services/student.service.ts`.
- Tests requeridos: tests unitarios de conversion de valores nulos/string numericos a numeros.
- Criterio de finalizacion: existe un contrato TypeScript con `promedioGeneral`, `asistenciaGlobal`, `recursosDisponibles` y `mensajesPendientes`.

## Task 3: Implementar consultas agregadas
- Objetivo: obtener desde PostgreSQL los indicadores confirmados por el esquema.
- Archivos esperados: `src/models/student.model.ts`.
- Tests requeridos: mocks de `pool.query` o tests de integracion disponibles para validar parametros y defaults.
- Criterio de finalizacion: las consultas usan parametros, devuelven una fila agregada y no inventan datos para fuentes inexistentes.

## Task 4: Crear servicio de dashboard estudiante
- Objetivo: orquestar modelo, aplicar redondeos y construir el JSON final.
- Archivos esperados: `src/services/student.service.ts`.
- Tests requeridos: casos con datos completos, sin notas, sin asistencia y valores nulos.
- Criterio de finalizacion: el servicio siempre devuelve los cuatro campos numericos bajo las reglas del spec.

## Task 5: Crear controller y ruta protegida
- Objetivo: exponer `GET /api/students/me/dashboard` con autenticacion y autorizacion por rol.
- Archivos esperados: `src/controllers/student.controller.ts`, `src/routes/student.routes.ts`, `src/app.ts`.
- Tests requeridos: sin token, rol no estudiante, estudiante inexistente y respuesta exitosa.
- Criterio de finalizacion: solo estudiantes autenticados pueden consultar su propio dashboard.

## Task 6: Documentar Swagger/OpenAPI
- Objetivo: agregar documentacion del endpoint siguiendo el estilo de rutas existentes.
- Archivos esperados: `src/routes/student.routes.ts`.
- Tests requeridos: `npm run build`.
- Criterio de finalizacion: Swagger describe seguridad Bearer, respuesta `200` y errores `401`, `403`, `404`, `500`.

## Task 7: Validacion final
- Objetivo: comprobar que la implementacion cumple el spec y no toca alcance no aprobado.
- Archivos esperados: cambios ya generados en tasks anteriores.
- Tests requeridos: `npm run build` y `npm test`.
- Criterio de finalizacion: build y tests pasan; no hay cambios de frontend ni cambios de esquema de base de datos.
