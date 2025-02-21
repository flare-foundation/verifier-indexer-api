<p align="center">
  <a href="https://flare.network/" target="blank"><img src="https://flare.network/wp-content/uploads/Artboard-1-1.svg" width="400" height="300" alt="Flare Logo" /></a>
</p>

# Verifier server API implementation

One can run the Verifier API service on three different sources:

- **BTC** / testBTC
- **XRP** / testXRP
- **DOGE** / testDOGE

For the API to function correctly, the service must be connected to the corresponding PostgreSQL database, which is populated using the appropriate indexing solution (e.g., BTC Indexer for BTC API Service).

## Local Installation

Make sure you're using the Node version specified in the `.nvmrc` file. We recommend using `nvm` to manage your local Node installations. Additionally, ensure that `yarn` is installed and enabled.

Install the dependencies

```bash
$ yarn install
```

## Configuration

Copy `.env.example` to `.env` and fill the required configuration.

## Running the app

To start app run

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev
```

## Testing with postgresql dump

Download the database instances from the following links:

- [BTC Testnet Database](https://githubstatic.flare.center/db_btc_testnet)
- [DOGE Testnet Database](https://githubstatic.flare.center/db_doge_testnet)
- [XRP Testnet Database](https://githubstatic.flare.center/db_xrp_testnet)

Move these database dumps to the `/e2e_tests/db/` directory. Currently, all databases are on testnets.

### Option 1: Running Tests Against a Database Instance

To run all tests across all sources or check code coverage, use the following commands:

```bash
yarn test run
yarn test coverage
```

### Option 2: Spinning Up a Database from a Dump and Persisting It

Depending on your source, create a database instance using the following command:

```bash
yarn test make_db btc
```

Once the database is up and running, you can start a local server and manually send requests. For this setup, set the following environment variables to your `.env` file:

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
