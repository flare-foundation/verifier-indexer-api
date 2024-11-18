FROM node:20-bullseye
WORKDIR /app/verifier-indexer-api
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "yarn.lock", "./"]
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    yarn install --frozen-lockfile

COPY . .
RUN yarn build
EXPOSE 3000

USER node

ENV PATH="${PATH}:/app/verifier-indexer-api/docker/scripts"
ENV NODE_ENV=production

ENTRYPOINT [ "/app/verifier-indexer-api/docker/scripts/entrypoint.sh" ]
CMD [ "yarn", "start:prod" ]
