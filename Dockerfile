# checkov:skip=CKV_DOCKER_2: Health check is managed by the orchestrator
# ---- Build stage ----
FROM node:24-slim@sha256:bf22df20270b654c4e9da59d8d4a3516cce6ba2852e159b27288d645b7a7eedc AS build

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
FROM gcr.io/distroless/nodejs24-debian13:nonroot@sha256:f16acace4aa70086d4a2caad6c716f01e3e2fe0dd8274c4530c7c17d987bdb1a AS runtime

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
