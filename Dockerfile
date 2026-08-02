FROM node:20-bookworm-slim

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
