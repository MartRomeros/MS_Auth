FROM node:22-alpine3.20 AS builder

# Habilitamos Corepack; usará la versión de pnpm fijada en "packageManager" de package.json
RUN corepack enable

WORKDIR /usr/app

# Copiamos package.json, el lockfile y la config de pnpm (allowBuilds vive acá)
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

COPY tsconfig.json ./

# Instalamos todas las dependencias (incluyendo devDependencies para compilar)
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

# --- ETAPA DE PRODUCCIÓN ---
FROM node:22-alpine3.20

RUN corepack enable

WORKDIR /app

# Copiamos el build desde la etapa anterior
COPY --from=builder /usr/app/dist ./dist
COPY --from=builder /usr/app/package.json /usr/app/pnpm-lock.yaml* /usr/app/pnpm-workspace.yaml* ./

# Instalamos solo las dependencias de producción de forma estricta
RUN pnpm install --prod --frozen-lockfile

CMD ["node", "dist/index.js"]
