FROM node:20-alpine AS build
WORKDIR /app
# Cài OpenSSL trước khi generate Prisma
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npx prisma generate

FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=build /app .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]