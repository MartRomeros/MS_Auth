# ms_authentication

Microservicio de autenticacion y perfil de usuarios construido con `Node.js`, `Express 5` y `TypeScript`. El servicio expone login con JWT, validacion de token, consulta de perfil y dashboards protegidos por rol para administradores, docentes y estudiantes.

Tambien esta preparado para dos formas de ejecucion:

- modo servidor tradicional con `app.listen(...)`
- modo serverless mediante `serverless-http` para AWS Lambda

## Stack actual

### Runtime y framework

- `node`
- `express@5`
- `typescript`

### Seguridad y API

- `jsonwebtoken` para emision y verificacion de JWT
- `bcrypt` para validacion segura de contrasenas
- `helmet` para headers de seguridad
- `cors` para acceso cross-origin
- `morgan` para logging HTTP
- `zod` para validacion de payloads

### Datos e integracion

- `pg` para acceso directo a PostgreSQL
- `dotenv` para configuracion por variables de entorno
- `swagger-jsdoc` + `swagger-ui-express` para documentacion OpenAPI
- `serverless-http` para empaquetar la app como handler Lambda

### Testing y desarrollo

- `vitest`
- `supertest`
- `ts-node-dev`
- `rimraf`

## Arquitectura y patrones

El proyecto sigue una arquitectura en capas, con separacion clara entre transporte HTTP, logica de negocio y acceso a datos:

```text
Request
  -> Route
  -> Middleware
  -> Controller
  -> Service
  -> Model
  -> PostgreSQL
```

### Patrones presentes en el codigo

- `Layered Architecture`: rutas, controladores, servicios y modelos separados por responsabilidad.
- `Middleware Pipeline`: autenticacion JWT, validacion y middlewares globales de seguridad.
- `Schema Validation`: los payloads se validan con Zod antes de llegar a la logica de negocio.
- `Stateless Authentication`: el estado de autenticacion viaja en JWT.
- `Role-based Access`: endpoints protegidos que autorizan por rol extraido desde el token.
- `Serverless Adapter`: la misma app Express puede correr localmente o como Lambda handler.

### Estructura del proyecto

```text
src/
  app.ts                  # configuracion de Express y middlewares globales
  index.ts                # entrypoint local y export del handler serverless
  config/                 # PostgreSQL y Swagger
  controllers/            # adaptadores HTTP
  middlewares/            # auth JWT y validacion
  models/                 # consultas SQL con pg
  routes/                 # definicion de endpoints y anotaciones OpenAPI
  schemas/                # contratos Zod y tipos
  services/               # logica de negocio
  tests/                  # pruebas con Vitest y Supertest
  utils/                  # JWT y bcrypt
```

## Dependencias externas necesarias

Para ejecutar el servicio correctamente necesitas:

- `Node.js 22` recomendado para alinear el entorno local con la imagen Docker actual (`node:22-alpine`)
- `npm`
- una instancia de `PostgreSQL`

Importante: este repositorio no incluye migraciones ni seeders. La base de datos debe existir previamente y contener, al menos, las tablas que el servicio consulta hoy, como:

- `usuarios`
- `roles`
- `estudiantes`
- `docentes`
- `apoderados`
- tablas utilizadas por los dashboards de administrador, docente y estudiante

## Variables de entorno

Crea un archivo `.env` en la raiz del proyecto:

```env
PORT=3000
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=ms_auth
DB_PASSWORD=postgres
DB_PORT=5432
DB_SSL=false
JWT_SECRET=una_clave_larga_y_segura
```

### Notas

- `DB_SSL=true` habilita conexion SSL con `rejectUnauthorized: false`.
- `JWT_SECRET` es obligatorio; sin esta variable no se podran firmar ni validar tokens.
- `PORT` debe existir para ejecucion local, ya que `src/index.ts` usa `process.env.PORT`.

## Instalacion local

```bash
npm install
```

## Scripts disponibles

```bash
npm run dev
npm run build
npm start
npm test
```

### Que hace cada script

- `npm run dev`: levanta el servicio con recarga en caliente desde `src/index.ts`.
- `npm run build`: compila TypeScript a `dist/`.
- `npm start`: ejecuta la version compilada.
- `npm test`: corre las pruebas con Vitest.

## Ejecucion local

1. Asegura que PostgreSQL este disponible y que las credenciales del `.env` sean correctas.
2. Instala dependencias con `npm install`.
3. Levanta el servicio:

```bash
npm run dev
```

El servicio quedara disponible, por defecto, en:

- `http://localhost:3000/health`
- `http://localhost:3000/api-docs`

## Endpoints principales

### Autenticacion

- `POST /api/auth/login`
- `GET /api/auth/validate`
- `GET /api/auth/profile`

### Dashboards protegidos por rol

- `GET /api/admin/me/dashboard`
- `GET /api/teachers/me/dashboard`
- `GET /api/students/me/dashboard`

Los endpoints protegidos esperan header:

```http
Authorization: Bearer <token>
```

## Ejecutar con Docker

El proyecto incluye un `Dockerfile` multi-stage:

- etapa `builder`: instala dependencias y compila TypeScript
- etapa final: copia `dist/` e instala solo dependencias de produccion

### 1. Construir la imagen

```bash
docker build -t ms_authentication .
```

### 2. Ejecutar el contenedor

```bash
docker run --rm -p 3000:3000 --env-file .env ms_authentication
```

### Consideraciones importantes para Docker

El contenedor necesita conectarse a PostgreSQL. El valor de `DB_HOST` cambia segun donde viva tu base de datos:

- si PostgreSQL corre en tu maquina host con Docker Desktop: usa `DB_HOST=host.docker.internal`
- si PostgreSQL corre en otro contenedor: usa el nombre del servicio o contenedor y conecta ambos a la misma red Docker
- si PostgreSQL corre en un servidor externo: usa el hostname real y configura `DB_SSL` segun corresponda

### Ejemplo: contenedor app conectado a una red existente

```bash
docker network create dev-network
docker run --rm --name ms_auth -p 3000:3000 --env-file .env --network dev-network ms_authentication
```

Si tu base de datos ya esta en esa misma red, define `DB_HOST` con el nombre del contenedor o servicio PostgreSQL.

### Ejemplo de `.env` para Docker Desktop en Windows/macOS

```env
PORT=3000
DB_USER=postgres
DB_HOST=host.docker.internal
DB_DATABASE=ms_auth
DB_PASSWORD=postgres
DB_PORT=5432
DB_SSL=false
JWT_SECRET=una_clave_larga_y_segura
```

## Documentacion OpenAPI

Swagger se genera a partir de anotaciones en `src/routes/*.ts`. Una vez levantado el servicio, la UI queda disponible en:

```text
http://localhost:3000/api-docs
```

## Calidad y seguridad

El servicio ya incorpora varias decisiones de base:

- validacion de entrada con Zod
- autenticacion basada en JWT
- proteccion de headers con Helmet
- logging de requests con Morgan
- separacion entre capa HTTP, logica y acceso a datos

## Testing actual

Las pruebas incluidas validan al menos:

- endpoint de health check
- disponibilidad de Swagger
- casos base del login y validacion de entrada

## Consideraciones de evolucion

Al revisar el estado actual del proyecto, hay dos puntos relevantes para cualquier despliegue:

- el servicio depende de una estructura de base de datos existente y no trae migraciones
- no hay `docker-compose.yml`, por lo que la orquestacion con PostgreSQL debe resolverse externamente o agregarse despues
