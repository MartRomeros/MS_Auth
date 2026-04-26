```
// Modelo Entidad-Relación - Colegio Bernardo O'Higgins

// Enfoque: Núcleo Académico y Conductual (Relacional)

// Nota: Mensajería se gestiona en DynamoDB/SQS (NoSQL)

  

// --- Módulo de Identidad y Acceso ---

  

Table roles {

rol_id integer [primary key, increment]

nombre varchar [not null, unique] // Administrador, Docente, Estudiante, Apoderado

}

  

Table usuarios {

usuario_id integer [primary key, increment]

rol_id integer [ref: > roles.rol_id]

rut varchar [unique, not null]

nombre varchar [not null]

apellido_paterno varchar [not null]

apellido_materno varchar

email varchar [unique, not null]

activo boolean [default: true]

}

  

Table estudiantes {

estudiante_id integer [primary key, ref: - usuarios.usuario_id]

curso_id integer [ref: > cursos.curso_id] // Vinculación directa según alcance del caso

}

  

Table docentes {

docente_id integer [primary key, ref: - usuarios.usuario_id]

especialidad varchar

}

  

Table apoderados {

apoderado_id integer [primary key, ref: - usuarios.usuario_id]

}

  

Table apoderado_estudiante {

apoderado_id integer [ref: > apoderados.apoderado_id]

estudiante_id integer [ref: > estudiantes.estudiante_id]

indexes {

(apoderado_id, estudiante_id) [pk]

}

}

  

// --- Módulo Gestión Académica ---

  

Table asignaturas {

asignatura_id integer [primary key, increment]

nombre varchar [not null]

siglas varchar [unique]

}

  

Table cursos {

curso_id integer [primary key, increment]

nivel varchar [not null]

letra char(1) [not null]

anio_academico integer [not null]

}

  

// Relación: Define qué docente enseña qué asignatura en qué curso

Table curso_asignatura_docente {

id integer [primary key, increment]

curso_id integer [ref: > cursos.curso_id]

asignatura_id integer [ref: > asignaturas.asignatura_id]

docente_id integer [ref: > docentes.docente_id]

}

  

Table evaluaciones {

evaluacion_id integer [primary key, increment]

cad_id integer [ref: > curso_asignatura_docente.id]

nombre varchar [not null]

fecha_evaluacion date

}

  

Table notas {

nota_id integer [primary key, increment]

evaluacion_id integer [ref: > evaluaciones.evaluacion_id]

estudiante_id integer [ref: > estudiantes.estudiante_id]

valor float [not null]

}

  

// --- Módulo Asistencia y Conducta ---

  

Table asistencia {

asistencia_id integer [primary key, increment]

estudiante_id integer [ref: > estudiantes.estudiante_id]

curso_id integer [ref: > cursos.curso_id]

fecha date [not null]

estado varchar [not null] // Presente, Ausente, Justificado, Atraso

tipo_asistencia varchar

}

  

Table anotaciones {

anotacion_id integer [primary key, increment]

estudiante_id integer [ref: > estudiantes.estudiante_id]

docente_id integer [ref: > docentes.docente_id]

tipo varchar [not null] // Positiva, Negativa

descripcion text [not null]

fecha_registro timestamp [default: `now()`]

}

  

Table salas{

sala_id serial [primary key]

}

  

Table sala_evaluacione_asistencia{

sala_id integer [ref: > salas.sala_id]

evaluacion_id integer [ref: > evaluaciones.evaluacion_id]

asistencia_id integer [ref: > asistencia.asistencia_id]

}
```