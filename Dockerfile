FROM node:24-bullseye
WORKDIR /app/verifier-indexer-api
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "yarn.lock", "./"]
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    yarn install --frozen-lockfile

COPY . .
RUN yarn build
EXPOSE 3000

RUN git describe --tags --always > PROJECT_VERSION && \
    date +%s > PROJECT_BUILD_DATE && \
    git rev-parse HEAD > PROJECT_COMMIT_HASH && \
    rm -rf .git

USER node

ENV PATH="${PATH}:/app/verifier-indexer-api/docker/scripts"
ENV NODE_ENV=production

ENTRYPOINT [ "/app/verifier-indexer-api/docker/scripts/entrypoint.sh" ]
CMD [ "yarn", "start:prod" ]
