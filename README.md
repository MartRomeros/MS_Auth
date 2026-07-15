# ms_authentication

Microservicio de autenticacion y perfil de usuarios construido con `Node.js`, `Express 5` y `TypeScript`. El servicio expone login con JWT, validacion de token, consulta de perfil y dashboards protegidos por rol para administradores, docentes y estudiantes.

El servicio corre como contenedor Docker y en produccion vive como **task de Amazon ECS con launch type Fargate** (sin servidores propios que administrar).

## Stack actual

### Runtime y framework

- `node` 22
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

### Testing y desarrollo

- `vitest`
- `supertest`
- `ts-node-dev`
- `rimraf`

### Gestor de paquetes

- `pnpm` (fijado en `package.json` via el campo `packageManager`, activado con Corepack)

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
- `Stateless Authentication`: el estado de autenticacion viaja en JWT, lo que hace al servicio apto para correr como multiples tasks de ECS detras de un load balancer sin estado compartido.
- `Role-based Access`: endpoints protegidos que autorizan por rol extraido desde el token.

### Estructura del proyecto

```text
src/
  app.ts                  # configuracion de Express y middlewares globales
  index.ts                # entrypoint, levanta el servidor con app.listen
  config/                 # PostgreSQL y Swagger
  controllers/            # adaptadores HTTP
  middlewares/            # auth JWT y validacion
  models/                 # consultas SQL con pg
  routes/                 # definicion de endpoints y anotaciones OpenAPI
  schemas/                # contratos Zod y tipos
  services/               # logica de negocio
  utils/                  # JWT y bcrypt
test/                     # pruebas con Vitest y Supertest
```

## Dependencias externas necesarias

Para ejecutar el servicio correctamente necesitas:

- `Node.js 22` (mismo mayor que la imagen Docker, `node:22-alpine3.20`)
- `pnpm` (via `corepack enable`, que respeta la version fijada en `packageManager` de `package.json`)
- una instancia de `PostgreSQL`

Importante: este repositorio no incluye migraciones ni seeders. La base de datos debe existir previamente y contener, al menos, las tablas que el servicio consulta hoy, como:

- `usuarios`
- `roles`
- `estudiantes`
- `docentes`
- `apoderados`
- tablas utilizadas por los dashboards de administrador, docente y estudiante

## Variables de entorno

Crea un archivo `.env` en la raiz del proyecto (ver `.env.example`):

```env
PORT=3000
JWT_SECRET=una_clave_larga_y_segura
SALT_ROUNDS=10
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=ms_auth
DB_SSL=false
```

### Notas

- `DB_SSL=true` habilita conexion SSL con `rejectUnauthorized: false`.
- `JWT_SECRET` es obligatorio; sin esta variable no se podran firmar ni validar tokens.
- `PORT` debe existir para ejecucion local y en el contenedor, ya que `src/index.ts` usa `process.env.PORT`.
- En ECS estas variables se inyectan desde la Task Definition (idealmente `JWT_SECRET` y `DB_PASSWORD` como secrets de AWS Secrets Manager / SSM Parameter Store, no como variables planas).

## Instalacion local

```bash
corepack enable
pnpm install
```

## Scripts disponibles

```bash
pnpm run dev
pnpm run build
pnpm start
pnpm test
```

### Que hace cada script

- `pnpm run dev`: levanta el servicio con recarga en caliente desde `src/index.ts`.
- `pnpm run build`: compila TypeScript a `dist/`.
- `pnpm start`: ejecuta la version compilada.
- `pnpm test`: corre las pruebas con Vitest.

## Ejecucion local

1. Asegura que PostgreSQL este disponible y que las credenciales del `.env` sean correctas.
2. Instala dependencias con `pnpm install`.
3. Levanta el servicio:

```bash
pnpm run dev
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

El proyecto incluye un `Dockerfile` multi-stage que usa `pnpm` (via Corepack) en ambas etapas:

- etapa `builder`: habilita Corepack, instala dependencias (incluye `pnpm-workspace.yaml`, necesario porque ahi vive `allowBuilds` que autoriza el build script nativo de `bcrypt`) y compila TypeScript
- etapa final: copia `dist/` e instala solo dependencias de produccion con `pnpm install --prod --frozen-lockfile`

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
- si PostgreSQL corre en un servidor externo (por ejemplo RDS): usa el hostname real y configura `DB_SSL` segun corresponda

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

## CI/CD

El workflow de GitHub Actions (`.github/workflows/deploy.yaml`) corre en cada push a `master`:

1. **`test`**: instala dependencias con `pnpm` (Node 22, cache de pnpm) y corre `vitest run --coverage`, subiendo el reporte como artifact.
2. **`build_and_push`** (depende de `test`): construye la imagen con Docker Buildx usando el `Dockerfile` del repo y la publica en Docker Hub con dos tags: `latest` y el `sha` del commit.

El pipeline no despliega directamente a ECS; el push de una imagen nueva a Docker Hub es el punto donde arranca el despliegue hacia la task de Fargate (manual o mediante un mecanismo externo, segun como este configurado el servicio de ECS).

## Despliegue en AWS ECS (Fargate)

En produccion el contenedor no corre en una EC2 propia: se ejecuta como **task de ECS con launch type Fargate**, usando la imagen publicada en Docker Hub por el CI/CD.

Puntos a tener en cuenta para la Task Definition / Service de ECS:

- **Puerto del contenedor**: debe coincidir con la variable `PORT` inyectada (por defecto `3000`), ya que `src/index.ts` levanta el servidor en `process.env.PORT`.
- **Healthcheck**: usar `GET /health` (responde `{ "status": "UP" }`) como health check del target group / load balancer.
- **Variables de entorno**: se definen en la Task Definition. `JWT_SECRET` y `DB_PASSWORD` deberian entrar como *secrets* (Secrets Manager o SSM Parameter Store) en vez de variables en texto plano.
- **Acceso a PostgreSQL**: la task de Fargate necesita conectividad de red (Security Groups / VPC) hacia la instancia de PostgreSQL (por ejemplo RDS); ajustar `DB_HOST`, `DB_PORT` y `DB_SSL` segun ese destino.
- **Imagen**: la Task Definition debe apuntar al repositorio `IMAGE_NAME` publicado por el workflow (tag `latest` o el `sha` especifico que se quiera fijar).

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

Al revisar el estado actual del proyecto, hay puntos relevantes para cualquier despliegue:

- el servicio depende de una estructura de base de datos existente y no trae migraciones
- no hay `docker-compose.yml`, por lo que la orquestacion con PostgreSQL debe resolverse externamente o agregarse despues
- no hay Task Definition ni infraestructura de ECS versionada en este repositorio; el despliegue a Fargate se gestiona fuera del codigo (consola AWS, IaC en otro repo, etc.)
