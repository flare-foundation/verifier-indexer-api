# checkov:skip=CKV_DOCKER_2: Health check is managed by the orchestrator
# ---- Build stage ----
FROM node:24.22.1-slim@sha256:1681862882da07ee5476fee047bcf34138833f1df42633bb25bcb0f438d5bf3d AS build

WORKDIR /app/verifier-indexer-api
ENV DEBIAN_FRONTEND=noninteractive

RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack prepare "$(node -p "require('./package.json').packageManager")" --activate && \
    pnpm install --frozen-lockfile

# Build
COPY . .
ENV CI=true
RUN pnpm run build && pnpm prune --prod

# Versioning metadata, served by the app at runtime.
# Values are injected by CI via build args and default to local-friendly values.
ARG PROJECT_VERSION=local
ARG PROJECT_COMMIT_HASH=local
RUN PROJECT_BUILD_DATE="$(date -u +%s)" && \
    printf '%s\n' "$PROJECT_VERSION" > PROJECT_VERSION && \
    printf '%s\n' "$PROJECT_BUILD_DATE" > PROJECT_BUILD_DATE && \
    printf '%s\n' "$PROJECT_COMMIT_HASH" > PROJECT_COMMIT_HASH

# ---- Runtime stage ----
FROM gcr.io/distroless/nodejs24-debian13:nonroot@sha256:78f07ef1b5ea71ad7c055df15d0dd8997f2d288f9158623c4d4ae3d765b7d50d AS runtime

WORKDIR /app/verifier-indexer-api
ENV NODE_ENV=production

COPY --chown=10001:10001 --from=build /app/verifier-indexer-api/dist ./dist
COPY --chown=10001:10001 --from=build /app/verifier-indexer-api/node_modules ./node_modules
COPY --chown=10001:10001 --from=build /app/verifier-indexer-api/package.json ./package.json

COPY --chown=10001:10001 --from=build /app/verifier-indexer-api/PROJECT_VERSION ./PROJECT_VERSION
COPY --chown=10001:10001 --from=build /app/verifier-indexer-api/PROJECT_BUILD_DATE ./PROJECT_BUILD_DATE
COPY --chown=10001:10001 --from=build /app/verifier-indexer-api/PROJECT_COMMIT_HASH ./PROJECT_COMMIT_HASH

USER 10001:10001

CMD [ "dist/main" ]
