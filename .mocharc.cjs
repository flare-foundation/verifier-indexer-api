// Defaults so `mocha path/to/spec.ts` works without exporting env first.
// Anything already in the environment wins.
process.env.API_KEYS ||= '12345';
process.env.DB_HOST ||= '127.0.0.1';
process.env.DB_PORT ||= '8080';
process.env.DB_USERNAME ||= 'user';
process.env.DB_PASSWORD ||= 'pass';
process.env.TESTNET ||= 'true';
process.env.NUMBER_OF_CONFIRMATIONS ||= '6';
process.env.INDEXER_SERVER_PAGE_LIMIT ||= '100';
// Per-chain helpers read this flag to pick the per-chain db name
// (dbbtc/dbxrp/…) that setup-db.sh creates.
process.env.RUNNING_ALL_TESTS ||= 'true';

module.exports = {
  require: ['ts-node/register'],
  extension: ['ts'],
  timeout: 5000,
};
