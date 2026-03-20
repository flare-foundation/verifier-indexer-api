# ---- Build stage ----
FROM node:24-slim@sha256:bf22df20270b654c4e9da59d8d4a3516cce6ba2852e159b27288d645b7a7eedc AS build

WORKDIR /app/verifier-indexer-api
ENV DEBIAN_FRONTEND=noninteractive

RUN corepack enable
COPY package.json pnpm-lock.yaml ./
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
FROM node:24-slim@sha256:bf22df20270b654c4e9da59d8d4a3516cce6ba2852e159b27288d645b7a7eedc AS runtime

WORKDIR /app/verifier-indexer-api
ENV NODE_ENV=production

COPY --from=build /app/verifier-indexer-api/dist ./dist
COPY --from=build /app/verifier-indexer-api/node_modules ./node_modules
COPY --from=build /app/verifier-indexer-api/package.json ./package.json
COPY --from=build /app/verifier-indexer-api/src/config/type-definitions ./src/config/type-definitions

COPY --from=build /app/verifier-indexer-api/PROJECT_VERSION ./PROJECT_VERSION
COPY --from=build /app/verifier-indexer-api/PROJECT_BUILD_DATE ./PROJECT_BUILD_DATE
COPY --from=build /app/verifier-indexer-api/PROJECT_COMMIT_HASH ./PROJECT_COMMIT_HASH

USER node

CMD [ "node", "dist/main" ]
