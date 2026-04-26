---
trigger: always_on
---

# Microservicio de Autenticación

Este es un microservicio construido con Node.js, Express y TypeScript, diseñado para gestionar la autenticación de usuarios utilizando JWT y almacenamiento en PostgreSQL.

Este microservicio operara bajo un lambda en AWS Academy bajo un contenedor docker que se construye a partir de la imagen del `Dockerfile` presente en el proyecto

## Dependencias de Producción

Estas dependencias pueden cambiar a lo largo del proyecto

| Dependencia | Uso |
| :--- | :--- |
| **express** | Framework web para la creación de la API y manejo de rutas. |
| **pg** | Cliente de PostgreSQL para interactuar con la base de datos. |
| **jsonwebtoken** | Implementación de JSON Web Tokens para la generación y validación de tokens de sesión. |
| **bcrypt** | Algoritmo de hashing para el cifrado seguro de contraseñas. |
| **dotenv** | Carga de variables de entorno desde un archivo `.env`. |
| **cors** | Middleware para habilitar el intercambio de recursos de origen cruzado. |
| **helmet** | Middleware de seguridad que ayuda a proteger la app configurando varios encabezados HTTP. |
| **morgan** | Logger de solicitudes HTTP para el monitoreo en desarrollo. |

## Estructura del proyecto

Esta estructura puede cambiar a lo largo del proyecto

- `src/`:
    - `config`
    - `routes/`:
    - `controllers/`:
    - `middlewares/`:
    - `models/`:
    - `utils/`:
    - `services/`:
    - `tests/`:

## Consideraciones

- Antes de ejecutar un spec dentro de la carpeta `specs/` es necesario echar un vistazo a la carpeta `context/` para saber que se esta construyendo.

- No instalar dependencias sin preguntar primero.

- Siempre despues terminar un spec, abajo de este se debe indicar lo realizado con su justificacion

- Cuando estes creando las funcionalidades separar las cosas por carpetas y dentro de estas por archivos

- Utilizar las skills necesarias para lograr la tarea

- Cada vez que implementes nuevas funcionalidades deberas crear una rama para esa funcionalidad
al terminar no debes hacer un merge sino una pull requests

- Esto microservicio estara en un lambda de aws, esta lambda usara una imagen de este