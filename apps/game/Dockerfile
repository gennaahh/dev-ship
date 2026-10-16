# Build dalla radice del repo: docker build -f apps/game/Dockerfile .
FROM oven/bun:1-alpine
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/game/package.json apps/game/
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN bun install --frozen-lockfile --production --filter @dev-city/game
COPY packages/shared packages/shared
COPY apps/game apps/game
WORKDIR /app/apps/game
ENV PORT=2567
EXPOSE 2567
# Niente --env-file: in produzione le variabili arrivano dall'ambiente del container.
CMD ["bun", "src/index.ts"]
