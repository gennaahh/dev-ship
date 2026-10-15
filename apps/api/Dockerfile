# Build dalla radice del repo: docker build -f apps/api/Dockerfile .
FROM oven/bun:1-alpine
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/
COPY apps/game/package.json apps/game/
RUN bun install --frozen-lockfile --production --filter @dev-city/api
COPY apps/api apps/api
WORKDIR /app/apps/api
ENV NODE_ENV=production
# Applica le migrazioni e poi avvia l'API. PORT lo imposta Railway.
CMD ["sh", "-c", "bun src/db/migrate.ts && bun src/index.ts"]
