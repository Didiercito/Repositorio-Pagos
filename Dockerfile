# -----------------------------
# Etapa 1: Build
# -----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos configs primero
COPY package*.json ./
COPY tsconfig.json ./

# Instalamos todas las dependencias
RUN npm install

# 🔐 FIX: Dar permisos de ejecución a tsc y demás binarios
RUN chmod -R +x node_modules/.bin

# Copiamos el resto del código
COPY . .

# Compilamos
RUN npm run build


# -----------------------------
# Etapa 2: runtime
# -----------------------------
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/tsconfig.json ./

CMD ["node", "dist/server.js"]
