# Microservicio de Autenticación

Este es un microservicio construido con Node.js, Express y TypeScript, diseñado para gestionar la autenticación de usuarios utilizando JWT y almacenamiento en PostgreSQL.

## Dependencias de Producción

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

## Dependencias de Desarrollo

| Dependencia | Uso |
| :--- | :--- |
| **typescript** | Lenguaje base que añade tipado estático a JavaScript. |
| **@types/* ** | Definiciones de tipos para las librerías de producción (node, express, pg, etc.). |
| **ts-node-dev** | Herramienta para ejecutar el proyecto en desarrollo con reinicio automático (hot-reload). |
| **rimraf** | Utilidad para eliminar carpetas (usada para limpiar el directorio `dist` antes de compilar). |

## Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo con `ts-node-dev`.
- `npm run build`: Compila el código TypeScript a JavaScript en la carpeta `dist`.
- `npm start`: Inicia el servidor utilizando el código compilado en `dist`.

## Configuración

Asegúrate de configurar las variables en el archivo `.env` antes de iniciar:

```env
PORT=3000
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=auth_db
JWT_SECRET=tu_secreto_para_jwt
```
