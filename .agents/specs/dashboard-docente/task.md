# Task: Dashboard docente

## Objetivo

Implementar una consulta de resumen para docentes autenticados que entregue la informacion necesaria para el panel principal del docente.

El resultado debe obtenerse segun el docente y debe incluir:

- Cantidad total de estudiantes asociados al docente.
- Cantidad de evaluaciones pendientes.
- Cantidad de asistencias registradas durante el dia actual.
- Cantidad de anotaciones del mes actual.
- Cursos, asignaturas y salas donde el docente imparte asignaturas.
- Cantidad de asistencias y promedio general por curso.

## Ubicacion del spec

Este spec vive en:

```text
.agents/specs/dashboard-docente/
```

## Alcance funcional

Crear un endpoint protegido para usuarios con rol docente:

```http
GET /api/teachers/me/dashboard
Authorization: Bearer <jwt>
```

El endpoint debe usar el `id` del token como `docente_id`. No debe aceptar `docente_id` desde query params ni body para evitar acceso horizontal a datos de otros docentes.

## Entregables de implementacion

1. Crear rutas, controlador, servicio y modelo siguiendo la estructura actual del proyecto:
   - `src/routes/teacher.routes.ts`
   - `src/controllers/teacher.controller.ts`
   - `src/services/teacher.service.ts`
   - `src/models/teacher.model.ts`
   - `src/schemas/teacher.schema.ts`, si se requiere tipar o normalizar la respuesta.

2. Registrar las rutas en `src/app.ts` bajo el prefijo `/api/teachers`.

3. Agregar autorizacion por rol:
   - Reutilizar `authenticateToken`.
   - Verificar que `req.user.role` sea `Docente` o normalizar el valor a minusculas antes de comparar.
   - Responder `403` si el usuario autenticado no es docente.

4. Implementar consultas SQL parametrizadas usando `pool.query` y el esquema real documentado en `.agents/context/script.sql.md`.

5. Agregar documentacion OpenAPI para el nuevo endpoint.

6. Agregar tests con Vitest/Supertest:
   - `200` para docente autenticado.
   - `401` sin token.
   - `403` con rol distinto a docente.
   - Respuesta con ceros y arreglos vacios si el docente no tiene datos asociados.

## Criterios de aceptacion

- El endpoint responde en formato JSON con las secciones `summary`, `assignments` y `courses`.
- Todas las metricas corresponden solo al docente autenticado.
- Las metricas dependientes de fecha usan una ventana temporal consistente para todo el request.
- Las consultas no duplican estudiantes por joins con asignaturas, salas, evaluaciones, asistencias o notas.
- El endpoint no filtra por datos enviados por el cliente salvo el token JWT.
- El SQL usa las tablas reales: `curso_asignatura_docente`, `evaluaciones`, `notas`, `asistencia`, `anotaciones`, `salas` y `sala_evaluacione_asistencia`.
- `npm test` y `npm run build` pasan.

## Mapeo del esquema real

Segun `.agents/context/script.sql.md`:

- La relacion docente-curso-asignatura es `curso_asignatura_docente` y su PK `id` se usa como `cad_id`.
- Las evaluaciones se relacionan con el docente a traves de `evaluaciones.cad_id`.
- Las asistencias se almacenan en `asistencia` y se relacionan con el docente a traves de `asistencia.cad_id`.
- Las anotaciones tienen `docente_id` directo y `fecha_registro`.
- Las notas se relacionan con el docente por `notas.evaluacion_id -> evaluaciones.cad_id -> curso_asignatura_docente.id`.
- Las salas no tienen nombre ni relacion directa con `curso_asignatura_docente`; solo aparecen en `sala_evaluacione_asistencia` vinculadas a evaluaciones o asistencias.

