ARG API_PROXY_TARGET=http://localhost:3000

FROM node:20-alpine AS build
ARG API_PROXY_TARGET
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN API_PROXY_TARGET=${API_PROXY_TARGET} npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
