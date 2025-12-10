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

- Node.js, as specified in the `.nvmrc` file. We recommend using `nvm` to manage versions.
- Yarn 1.22.x
- Docker Desktop (or Docker Engine) with Docker Compose v2 — required for tests
- Git

Install the dependencies:

```bash
$ yarn install
```

### Configuration

Copy `.env.example` to `.env` and fill the required configuration parameters.


### Running the app

To start app run:

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev
```

### Testing

End-to-end tests for blockchain verifier types require indexer database access.

To download database snapshots, run:

```bash
yarn test download
```

> **Manual download (alternative)**
>
> You can also download the database snapshots manually and move them to `/e2e_tests/db/`:
>
> - [BTC Testnet Database](https://githubstatic.flare.center/db_btc_testnet) as `db_btc_testnet`
> - [BTC2 Testnet Database](https://githubstatic.flare.center/db_btc2_testnet) as `db_btc2_testnet`
> - [DOGE Testnet Database](https://githubstatic.flare.center/db_doge_testnet) as `db_doge_testnet`
> - [XRP Testnet Database](https://githubstatic.flare.center/db_xrp_testnet) as `db_xrp_testnet`
> - [XRP2 Testnet Database](https://githubstatic.flare.center/db_xrp2_testnet) as `db_xrp2_testnet`
>
> Currently, all snapshots are from testnets.

To run all tests across all sources or check code coverage, use the following commands:

```bash
yarn test run
yarn test coverage
```

#### Manual testing

To test a specific verifier type you can also instantiate only the relevant indexer db. For example, for `btc` verifier type:

```bash
yarn test make_db btc
```

This will create and start a local Postgres database server with the Bitcoin testnet snapshot.

Once the database is up and running, you can start a local server and manually send requests. For this setup, set the
following environment variables to your `.env` file:

```bash
# .env file
DB_DATABASE=db
DB_USERNAME=user
DB_PASSWORD=pass
DB_HOST=127.0.0.1
DB_PORT=8080
```

Additionally, set the appropriate values for `VERIFIER_TYPE` and `TESTNET`:

```bash
VERIFIER_TYPE=btc
TESTNET=true
```

When you're finished, remember to stop the database server with:

```bash
yarn test delete_db
```
     
### Linting and formatting

We use ESLint and Prettier:
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
## Proposing Web2Json attestation type source changes

Community members can propose adding or removing supported Web2 API endpoints by updating the `Web2Json` source list at [src/config/web2/web2-json-sources.ts](src/config/web2/web2-json-sources.ts) and opening a pull request.

Use the following PR [template](src/config/web2/pull_request_template.md) and follow the checklist.

This will undergo an initial review by the Flare Foundation and then be submitted to the Management Group for voting.
If accepted, the changes will be applied and rolled out in phases: first on Songbird and then on Flare.
