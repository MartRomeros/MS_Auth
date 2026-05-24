# Spec: Dashboard de Estudiante

## Objetivo
Exponer un endpoint autenticado para que un estudiante consulte los indicadores resumidos de su dashboard:

```json
{
  "promedioGeneral": 6.1,
  "asistenciaGlobal": 94,
  "recursosDisponibles": 12,
  "mensajesPendientes": 2
}
```

El endpoint debe calcular los datos desde la base definida por `script.sql` cuando las tablas y relaciones necesarias existan. Si el esquema no contiene información suficiente para uno o más indicadores, la implementación debe dejarlo explícito antes de construir lógica incompleta.

## Alcance
- Revisar `script.sql` para confirmar tablas, columnas y relaciones necesarias.
- Crear un endpoint REST para el dashboard del estudiante autenticado.
- Validar que el usuario autenticado tenga rol `estudiante`.
- Obtener el identificador del estudiante desde el token actual.
- Calcular `promedioGeneral` desde las notas asociadas al estudiante.
- Calcular `asistenciaGlobal` como porcentaje de asistencia del estudiante sobre el total de registros aplicables.
- Calcular `recursosDisponibles` desde los recursos disponibles para el curso o asignaturas del estudiante, si el esquema lo soporta.
- Calcular `mensajesPendientes` desde mensajes/notificaciones pendientes del estudiante, si el esquema lo soporta.
- Responder siempre con las cuatro propiedades del contrato, usando valores numericos.
- Documentar el endpoint en Swagger/OpenAPI siguiendo el estilo actual del proyecto.
- Agregar tests relacionados para autorización, contrato de respuesta y casos sin datos.

## Fuera de alcance
- Crear o modificar tablas de base de datos.
- Implementar frontend Angular del dashboard.
- Cambiar el mecanismo actual de autenticación JWT.
- Cambiar el formato del token.
- Agregar filtros por periodo, asignatura o curso.
- Implementar mensajes, recursos o asistencia si el esquema no los modela.
- Crear dashboards para apoderados, docentes u otros roles.

## Reglas de negocio
- Solo usuarios con rol `estudiante` pueden consumir el endpoint.
- El estudiante solo puede consultar su propio dashboard.
- Si el token no existe o es invalido, responder `401` o `403` segun el comportamiento actual del middleware.
- Si el usuario autenticado no tiene rol `estudiante`, responder `403`.
- Si el estudiante no existe o no esta activo, responder `404`.
- `promedioGeneral` debe ser el promedio aritmetico de las notas numericas del estudiante, redondeado a un decimal.
- Si el estudiante no tiene notas, `promedioGeneral` debe ser `0`.
- `asistenciaGlobal` debe ser un porcentaje entero de registros presentes sobre registros totales, redondeado al entero mas cercano.
- Si el estudiante no tiene registros de asistencia, `asistenciaGlobal` debe ser `0`.
- `recursosDisponibles` debe contar recursos activos/disponibles para el estudiante segun su curso, asignaturas o reglas presentes en el esquema.
- Si el esquema no contiene recursos, `recursosDisponibles` debe quedar bloqueado como dato no implementable y documentarse antes de continuar.
- `mensajesPendientes` debe contar mensajes o notificaciones no leidas/pendientes asociadas al estudiante.
- Si el esquema no contiene mensajes/notificaciones, `mensajesPendientes` debe quedar bloqueado como dato no implementable y documentarse antes de continuar.
- La respuesta no debe exponer datos personales, detalles de notas, detalle de asistencia, IDs internos ni listas auxiliares.

## Contrato API
- Metodo: `GET`
- Ruta propuesta: `/api/students/me/dashboard`
- Autenticacion: Bearer token JWT.
- Respuesta `200`:

```json
{
  "promedioGeneral": 6.1,
  "asistenciaGlobal": 94,
  "recursosDisponibles": 12,
  "mensajesPendientes": 2
}
```

## Criterios de aceptacion
- Dado un estudiante autenticado, cuando llama `GET /api/students/me/dashboard`, entonces recibe `200` con `promedioGeneral`, `asistenciaGlobal`, `recursosDisponibles` y `mensajesPendientes`.
- Dado un estudiante con notas registradas, cuando consulta el dashboard, entonces `promedioGeneral` corresponde al promedio redondeado a un decimal.
- Dado un estudiante sin notas, cuando consulta el dashboard, entonces `promedioGeneral` es `0`.
- Dado un estudiante con registros de asistencia, cuando consulta el dashboard, entonces `asistenciaGlobal` corresponde al porcentaje de asistencia redondeado a entero.
- Dado un estudiante sin registros de asistencia, cuando consulta el dashboard, entonces `asistenciaGlobal` es `0`.
- Dado un usuario con rol distinto de `estudiante`, cuando consulta el endpoint, entonces recibe `403`.
- Dado un request sin token, cuando consulta el endpoint, entonces recibe error de autenticacion segun el middleware actual.
- Dado un token valido para un estudiante inexistente o inactivo, cuando consulta el endpoint, entonces recibe `404`.
- Si `script.sql` no permite calcular recursos o mensajes, la implementacion no debe inventar datos y debe dejar el bloqueo documentado.
- El contrato Swagger/OpenAPI debe incluir ruta, seguridad, respuesta `200`, errores esperados y schema de respuesta.
- `npm run build` debe pasar.
- `npm test` debe pasar.

## Preguntas abiertas
- En el workspace actual no se encontro `script.sql`; debe agregarse o indicarse su ubicacion antes de implementar.
- Confirmar los nombres exactos de tablas/columnas para recursos disponibles.
- Confirmar los nombres exactos de tablas/columnas para mensajes pendientes.
- Confirmar si asistencia se mide por estudiante individual o por eventos del curso con detalle de presentes/ausentes.
- Confirmar si el promedio debe considerar todas las notas historicas o solo el anio academico/curso actual.

## Riesgos tecnicos
- El esquema podria no tener tablas de recursos o mensajes, lo que haria imposible calcular dos campos del contrato sin cambios de base de datos.
- Si asistencia esta modelada solo por curso/asignatura y no por estudiante, `asistenciaGlobal` no puede representar asistencia individual.
- Si las notas no tienen relacion directa con estudiante y evaluacion, la consulta podria requerir joins adicionales o reglas no obvias.
- Consultas agregadas mal indexadas podrian afectar latencia cuando existan muchos registros academicos.
- El proyecto ya tiene dashboard docente; duplicar patrones sin abstraer lo necesario puede generar inconsistencias entre dashboards.
