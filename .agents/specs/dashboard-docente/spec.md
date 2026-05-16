# Spec: Dashboard docente

## Resumen

Se requiere exponer un endpoint de lectura para que un docente consulte su dashboard operativo. La respuesta debe consolidar indicadores generales, asignaciones academicas y estadisticas por curso sin permitir que el cliente consulte informacion de otro docente.

Este documento esta alineado con el esquema disponible en `.agents/context/script.sql.md`.

## Actor principal

- Docente autenticado mediante JWT.

## Endpoint

```http
GET /api/teachers/me/dashboard
Authorization: Bearer <jwt>
```

## Autorizacion

- `401 Unauthorized`: token ausente, invalido o expirado.
- `403 Forbidden`: token valido, pero rol distinto de docente.
- `200 OK`: docente autenticado y consulta ejecutada correctamente.

El seed de base de datos usa el rol `Docente` con mayuscula inicial. La implementacion debe normalizar el rol antes de comparar:

```ts
String(user.role).toLowerCase() === 'docente'
```

## Respuesta exitosa

```json
{
  "summary": {
    "totalStudents": 0,
    "pendingEvaluations": 0,
    "todayAttendances": 0,
    "monthlyAnnotations": 0
  },
  "assignments": [
    {
      "cadId": 1,
      "courseId": 1,
      "courseName": "1° Medio A",
      "subjectId": 1,
      "subjectName": "Matemática",
      "subjectCode": "MAT01",
      "roomIds": [1]
    }
  ],
  "courses": [
    {
      "courseId": 1,
      "courseName": "1° Medio A",
      "attendanceCount": 0,
      "generalAverage": 0
    }
  ]
}
```

## Reglas de negocio

### Cantidad total de estudiantes

Contar estudiantes distintos que pertenezcan a cursos donde el docente tenga al menos una asignacion en `curso_asignatura_docente`.

Regla anti-duplicacion:

```sql
COUNT(DISTINCT e.estudiante_id)
```

### Evaluaciones pendientes

El esquema real de `evaluaciones` no tiene columna `estado`. Por eso, para este spec, una evaluacion pendiente es una evaluacion asociada al docente cuya `fecha_evaluacion` es mayor o igual a `CURRENT_DATE`.

Si mas adelante se agrega un estado de evaluacion, se debe reemplazar esta regla por estados explicitos.

### Asistencias registradas del dia de hoy

Contar registros de la tabla `asistencia` asociados al docente por `cad_id` y cuya `fecha` corresponda al dia actual.

Como `asistencia.fecha` es de tipo `date`, la condicion esperada es:

```sql
a.fecha = CURRENT_DATE
```

### Anotaciones del mes

Contar anotaciones creadas por el docente durante el mes calendario actual usando `anotaciones.fecha_registro`.

Ventana recomendada:

```sql
an.fecha_registro >= date_trunc('month', CURRENT_DATE)
AND an.fecha_registro < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
```

### Cursos, asignaturas y salas

Retornar una fila por asignacion en `curso_asignatura_docente`.

Campos requeridos:

- `cadId`: `curso_asignatura_docente.id`.
- `courseId`: `cursos.curso_id`.
- `courseName`: concatenacion de `cursos.nivel` y `cursos.letra`.
- `subjectId`: `asignaturas.asignatura_id`.
- `subjectName`: `asignaturas.nombre`.
- `subjectCode`: `asignaturas.siglas`.
- `roomIds`: salas encontradas por `sala_evaluacione_asistencia` para evaluaciones o asistencias relacionadas al `cad_id`.

El esquema real de `salas` solo contiene `sala_id`, por lo que no debe prometerse `roomName` salvo que se modifique la base de datos.

### Asistencias y promedio general por curso

Por cada curso asignado al docente:

- `attendanceCount`: cantidad de registros en `asistencia` asociados a cualquier `cad_id` del docente en ese curso.
- `generalAverage`: promedio de `notas.valor` en evaluaciones asociadas a cualquier `cad_id` del docente en ese curso.

El promedio debe retornar `0` si no existen notas.

## Contrato de errores

```json
{
  "message": "Unauthorized"
}
```

```json
{
  "message": "Forbidden: teacher role required"
}
```

```json
{
  "message": "Internal server error"
}
```

## Requisitos no funcionales

- Seguridad: no recibir `docente_id` desde el cliente.
- Mantenibilidad: encapsular SQL en `TeacherModel`.
- Rendimiento: usar consultas agregadas y evitar N+1 queries por curso.
- Observabilidad: loguear errores en controlador, sin exponer SQL ni stack traces al cliente.
- Consistencia: usar la misma referencia temporal de base de datos para todo el request.

## Casos borde

- Docente sin cursos asignados: responder metricas en `0` y arreglos vacios.
- Curso sin estudiantes: incluir el curso en `assignments`; `courses.generalAverage` debe ser `0`.
- Curso con varias asignaturas del mismo docente: no duplicar estudiantes en `summary.totalStudents`.
- Asignacion sin sala detectada: retornar `roomIds: []`.
- Datos seed con fechas antiguas: las metricas de hoy y evaluaciones pendientes pueden responder `0` si `CURRENT_DATE` no coincide con los datos cargados.

