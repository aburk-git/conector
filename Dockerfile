FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiamos solo los manifiestos primero (mejor cache de Docker)
COPY package*.json ./
COPY prisma ./prisma

RUN npm install --omit=dev

# Generar el cliente de Prisma (necesita el schema, ya copiado arriba)
RUN npx prisma generate

# Copiamos el resto del código
COPY . .

EXPOSE 4000

# Al iniciar el contenedor: aplicar migraciones pendientes y luego levantar el server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
