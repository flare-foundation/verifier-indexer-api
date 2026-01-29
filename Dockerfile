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
RUN pnpm run build
RUN pnpm prune --prod

# Versioning metadata, served by the app at runtime
RUN (git describe --tags --always > PROJECT_VERSION || echo "unknown" > PROJECT_VERSION) && \
    date +%s > PROJECT_BUILD_DATE && \
    (git rev-parse HEAD > PROJECT_COMMIT_HASH || echo "unknown" > PROJECT_COMMIT_HASH)

# ---- Runtime stage ----
FROM node:24-slim@sha256:bf22df20270b654c4e9da59d8d4a3516cce6ba2852e159b27288d645b7a7eedc AS runtime

WORKDIR /app/verifier-indexer-api
ENV NODE_ENV=production

COPY --from=build /app/verifier-indexer-api/dist ./dist
COPY --from=build /app/verifier-indexer-api/node_modules ./node_modules
COPY --from=build /app/verifier-indexer-api/package.json ./package.json

COPY --from=build /app/verifier-indexer-api/PROJECT_VERSION ./PROJECT_VERSION
COPY --from=build /app/verifier-indexer-api/PROJECT_BUILD_DATE ./PROJECT_BUILD_DATE
COPY --from=build /app/verifier-indexer-api/PROJECT_COMMIT_HASH ./PROJECT_COMMIT_HASH

EXPOSE 3000
USER node

CMD [ "node", "dist/main" ]
