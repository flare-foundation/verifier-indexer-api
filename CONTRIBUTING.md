# Contributing

This document describes the process of contributing to this project. It is
intended for anyone considering opening an issue or pull request.

## AI Assistance

Any significant use of the AI assistance in the contribution MUST be disclosed in the pull request along with the extent of the use.

An example disclosure:

> This PR was written primarily by Claude Code.

Or a more detailed disclosure:

> I consulted ChatGPT for the following code snippets: ...

## Quick start

If you'd like to contribute, report a bug, suggest a feature or you've
implemented a feature you should open an issue or pull request.

Any contribution to the project is expected to contain code that is formatted,
linted and that the existing tests still pass. Adding unit tests for new code is
also welcome.

## Dev environment

Prerequisites:

- Node.js 20+ (LTS recommended)
- Yarn 1.22.x
- Docker Desktop (or Docker Engine) with Docker Compose v2 — required for tests
- Git

Setup:

1. Install dependencies

   ```bash
   yarn install
   ```

2. Build (TypeScript → dist)

   ```bash
   yarn build
   ```

3. Run locally

   - Development (watch mode):

     ```bash
     yarn start:dev
     ```

   - Standard start (no watch):

     ```bash
     yarn start
     ```

   - Production (after build):

     ```bash
     yarn start:prod
     ```
     
## Linting and formatting

We use ESLint and Prettier.

Common commands:

- Check lint:

  ```bash
  yarn lint:check
  ```

- Auto-fix lint issues:

  ```bash
  yarn lint:fix
  ```

- Check formatting:

  ```bash
  yarn format:check
  ```

- Auto-format:

  ```bash
  yarn format:fix
  ```
  
## Testing

Tests are run with Mocha (TypeScript via ts-node) and require a Postgres Docker container that is managed by our test script.

Quick run (spins up DB, runs tests, tears down DB):

```bash
# run all e2e + unit tests
yarn test run
```

Coverage:

```bash
yarn test coverage
# HTML and text reports under ./coverage
```
## Proposing Web2Json attestation type source changes

Community members can propose adding or removing supported Web2 API endpoints by updating the `Web2Json` source list at [src/config/web2/web2-json-sources.ts](src/config/web2/web2-json-sources.ts) and opening a pull request.

Use the following PR [template](src/config/web2/pull_request_template.md) and follow the checklist.

This will undergo an initial review by the Flare Foundation and then be submitted to the Management Group for voting.
If accepted, the changes will be applied and rolled out in phases: first on Songbird and then on Flare.
