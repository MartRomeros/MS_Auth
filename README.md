# Microservicio de Autenticación (ms_authentication)

Este proyecto es un microservicio robusto encargado de la gestión de autenticación y perfiles de usuario. Está construido utilizando **Node.js** con **Express 5** y **TypeScript**, siguiendo una arquitectura de capas limpia y preparada para despliegues tanto en servidores tradicionales como en entornos Serverless (AWS Lambda).

## 🚀 Tecnologías y Dependencias

A continuación se detallan las dependencias principales del proyecto y su justificación técnica:

### Dependencias de Producción

| Dependencia | Propósito | Justificación Técnica |
| :--- | :--- | :--- |
| **express (v5.2.1)** | Framework Web | Versión más reciente que soporta de forma nativa la gestión de promesas en los controladores, eliminando la necesidad de bloques `try/catch` repetitivos o envoltorios para errores asíncronos. |
| **typescript** | Tipado Estático | Garantiza la integridad del código, reduce errores en tiempo de ejecución y mejora la productividad mediante el autocompletado y la documentación en tiempo real. |
| **pg (node-postgres)** | Cliente Base de Datos | Cliente oficial y eficiente para PostgreSQL. Permite la gestión de pools de conexión, fundamental para el rendimiento en microservicios. |
| **zod** | Validación de Esquemas | Librería de declaración y validación de esquemas con inferencia de tipos de TypeScript de primera clase. Se utiliza para validar cuerpos de peticiones (Body), parámetros y entornos. |
| **jsonwebtoken (JWT)** | Autenticación | Estándar de la industria para la creación de tokens de acceso seguros y sin estado (stateless), permitiendo la escalabilidad horizontal. |
| **bcrypt** | Seguridad de Contraseñas | Implementa hashing de contraseñas con sal (salt), protegiendo las credenciales de los usuarios contra ataques de fuerza bruta y tablas de arcoíris. |
| **helmet** | Seguridad HTTP | Middleware que ayuda a proteger la aplicación configurando varios encabezados HTTP de seguridad (XSS protection, Content Security Policy, etc.). |
| **cors** | Gestión de Recursos | Habilita el Intercambio de Recursos de Origen Cruzado (CORS), necesario para permitir que clientes (Frontend) desde otros dominios consuman la API. |
| **serverless-http** | Adaptador Serverless | Permite envolver la aplicación Express para que pueda ejecutarse en AWS Lambda sin modificar la lógica central del microservicio. |
| **swagger-jsdoc / ui** | Documentación API | Genera documentación interactiva basada en el estándar OpenAPI (Swagger), facilitando la integración con otros equipos y el testing manual. |
| **morgan** | Logging | Logger de peticiones HTTP para el desarrollo y monitoreo de las interacciones con la API. |
| **dotenv** | Configuración | Carga variables de entorno desde un archivo `.env` para separar la configuración del código fuente (siguiendo los principios de *The Twelve-Factor App*). |

### Dependencias de Desarrollo

*   **vitest**: Framework de testing moderno y extremadamente rápido, compatible con el ecosistema de TypeScript.
*   **supertest**: Utilizado para realizar tests de integración de los endpoints HTTP.
*   **ts-node-dev**: Herramienta de desarrollo que reinicia el servidor automáticamente tras cambios en el código TypeScript.
*   **rimraf**: Utilidad para limpiar el directorio de compilación (`dist`) de forma multiplataforma.

---

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una estructura de capas para asegurar la separación de responsabilidades y facilitar el mantenimiento:

```text
src/
├── app.ts              # Configuración central de Express y Middlewares
├── index.ts            # Punto de entrada (Servidor local y Handler Lambda)
├── config/             # Configuraciones de DB, Swagger y entorno
├── controllers/        # Controladores de tráfico (Orquestan Req/Res)
├── services/           # Lógica de negocio (Capa pura de procesos)
├── models/             # Interacción con la base de datos (Data Access)
├── middlewares/        # Filtros de seguridad, validación y autenticación
├── schemas/            # Definiciones de esquemas Zod (Validación de datos)
├── routes/             # Definición de rutas y documentación OpenAPI
├── utils/              # Funciones de ayuda (JWT, Bcrypt, Helpers)
└── tests/              # Tests unitarios y de integración
```

---

## 🛠️ Instalación y Uso

### Requisitos Previos
*   Node.js (v18+)
*   PostgreSQL

### Configuración del Entorno
Crea un archivo `.env` en la raíz del proyecto basado en las variables requeridas en `src/config/database.ts`:
```env
PORT=3000
DB_USER=tu_usuario
DB_HOST=localhost
DB_DATABASE=ms_auth
DB_PASSWORD=tu_password
DB_PORT=5432
JWT_SECRET=una_clave_secreta_muy_larga
```

### Comandos Disponibles
*   `npm install`: Instala las dependencias.
*   `npm run dev`: Inicia el servidor de desarrollo con recarga en caliente.
*   `npm run build`: Compila el proyecto a JavaScript puro en la carpeta `dist`.
*   `npm start`: Ejecuta la versión compilada del proyecto.
*   `npm test`: Ejecuta la suite de pruebas con Vitest.

---

## 📑 Documentación de la API
Una vez que el servidor esté en ejecución, puedes acceder a la documentación interactiva en:
`http://localhost:3000/api-docs`

Esta documentación detalla los endpoints de:
*   **POST /api/auth/login**: Autenticación de usuarios.
*   **GET /api/auth/validate**: Validación de tokens JWT.
*   **GET /api/auth/profile**: Obtención del perfil completo del usuario autenticado.

---

## 🔒 Seguridad Implementada
1.  **Hasing**: Las contraseñas nunca se almacenan en texto plano (Bcrypt).
2.  **Validación**: Todas las entradas son validadas estrictamente con Zod antes de llegar a la lógica de negocio.
3.  **Encabezados**: Uso de Helmet para mitigar vulnerabilidades web comunes.
4.  **Tokens**: Implementación de JWT con expiración para sesiones seguras.


para levantar contenedor docker:
`docker run -d --name ms_auth -p 3000:3000 --env-file .env --network devops_default  ms_auth `