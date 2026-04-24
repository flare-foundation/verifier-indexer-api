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
- pnpm 10.28.0
- Docker Desktop (or Docker Engine) with Docker Compose v2 — required for tests
- Git

Install the dependencies:

```bash
$ pnpm install
```

### Configuration

Copy `.env.example` to `.env` and fill the required configuration parameters.


### Running the app

To start app run:

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev
```

### Testing

End-to-end tests for blockchain verifier types require indexer database
snapshots. Download them once with:

```bash
pnpm test:download
```

Snapshots are fetched from the URLs below and verified against a known SHA-256. They land in `test/e2e_tests/db/`.

> **Manual download (alternative)**
>
> You can also fetch the snapshots by hand and drop them in `test/e2e_tests/db/`:
>
> - [BTC Testnet Database](https://githubstatic.flare.center/db_btc_testnet) as `db_btc_testnet`
> - [BTC2 Testnet Database](https://githubstatic.flare.center/db_btc2_testnet) as `db_btc2_testnet`
> - [DOGE Testnet Database](https://githubstatic.flare.center/db_doge_testnet) as `db_doge_testnet`
> - [XRP Testnet Database](https://githubstatic.flare.center/db_xrp_testnet) as `db_xrp_testnet`
> - [XRP2 Testnet Database](https://githubstatic.flare.center/db_xrp2_testnet) as `db_xrp2_testnet`
> - [XRP Mainnet Database](https://githubstatic.flare.center/db_xrp_mainnet) as `db_xrp_mainnet`

| Database | Network | Starting Block | End Block |
|----------|---------|----------------|-----------|
| db_btc_testnet | BTC Testnet | 3490151 | 3490156 |
| db_btc2_testnet | BTC Testnet | 75487 | 75495 |
| db_doge_testnet | DOGE Testnet | 6724525 | 6724602 |
| db_xrp_testnet | XRP Testnet | 2882019 | 2883195 |
| db_xrp2_testnet | XRP Testnet | 10172243 | 10172442 |
| db_xrp_mainnet | XRP Mainnet | 103751330 | 103751443 |

Bring up the local postgres container and restore the snapshots into per-chain databases (`dbbtc`, `dbdoge`, `dbxrp`, …):

```bash
pnpm test:db:up           # all chains
pnpm test:db:up xrp xrp2  # only the given chains
```

Then run tests:

```bash
pnpm test             # e2e + unit
pnpm test:e2e         # e2e only (all chains)
pnpm test:e2e xrp     # a single chain
pnpm test:unit        # unit only
pnpm test:coverage    # nyc-wrapped full run
```

When you're done:

```bash
pnpm test:db:down
```

#### Running a single spec file (IDE or CLI)

Once `pnpm test:db:up <chain>` has been run, invoke mocha directly against any
spec file. `.mocharc.cjs` sets env defaults and registers ts-node, so no extra
flags are needed:

```bash
pnpm test:e2e:file test/e2e_tests/xrp/payment/payment_mic.e2e-spec.ts
```

#### Manual server against a test snapshot

Point a manually-started verifier server at a chain's test DB:

```bash
pnpm test:db:up btc
```

Then set your `.env`:

```bash
DB_DATABASE=dbbtc
DB_USERNAME=user
DB_PASSWORD=pass
DB_HOST=127.0.0.1
DB_PORT=8080
VERIFIER_TYPE=btc
TESTNET=true
```

Tear down with `pnpm test:db:down`.
     
### Linting and formatting

We use ESLint and Prettier:
- Check lint:

  ```bash
  pnpm lint:check
  ```

- Auto-fix lint issues:

  ```bash
  pnpm lint:fix
  ```

- Check formatting:

  ```bash
  pnpm format:check
  ```

- Auto-format:

  ```bash
  pnpm format:fix
  ```
## Generating DTO files

Attestation type DTO files are generated against the `@flarenetwork/js-flare-common` library. To update DTOs to new attestation type definitions, first update the library dependency and then regenerate:

```bash
pnpm generate:dto
```

Note that the generated code may contain unused imports, so a manual review is still needed after generation. Removing the `TypeTemplate` definition from the generated output is also preferred.

## Proposing Web2Json attestation type source changes

Community members can propose adding or removing supported Web2 API endpoints by updating the `Web2Json` source list at [src/config/web2/web2-json-sources.ts](src/config/web2/web2-json-sources.ts) and opening a pull request.

Use the following PR [template](src/config/web2/pull_request_template.md) and follow the checklist.

This will undergo an initial review by the Flare Foundation and then be submitted to the Management Group for voting.
If accepted, the changes will be applied and rolled out in phases: first on Songbird and then on Flare.
