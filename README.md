<p align="center">
  <a href="https://flare.network/" target="blank"><img src="https://flare.network/wp-content/uploads/Artboard-1-1.svg" width="400" height="300" alt="Flare Logo" /></a>
</p>

Verifier server API implementation

You can run the verifier api service on 3 different sources:
* BTC / testBTC
* XRP / testXRP
* DOGE / testDOGE

For the api to work properly the service must be connected to the appropriate underlying postgresql database that is being filled with the the aproriate indexing solution (BTC indexer -> BTC api service)




## Local Installation

Make sure you are using the node version specified in .nvmrc file. We recommend that you use `nvm` to manage local node installations. Make sure to use/enable `yarn`

Install the dependencies
```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Testing with postgresql dump

Get DB instances from some persistent storage, or ask other devs

Move those db dumps to /e2e_tests/db/

set .env, you will need to specify the right value for `VERIFIER_TYPE` and `TESTNET` variables
for now all dbs are on testnets, so provide `TESTNET=true`

### option1: running tests against db instance

depending on your source, use the following command (btc example)
```yarn test:btc```

### option2: spinning up db from dumpb and persist it

again depending on your sourrce create db instance
```yarn test:make_db:btc```
after that db will be available and you can 
1. run tests against it, to do so use `yarn test:run_tests:btc`
2. start up local server and make requests by hand

After you are done make sure to stop the db server with
```yarn test:delete_db```


