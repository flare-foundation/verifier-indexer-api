# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.7.0] - 2026-10-26

### Added

- Added `ARB` as a supported EVM verifier type.
- Added `GET /api/version` to EVM verifiers, returning api server version, node client version and chain id.
- `KEEP_ALIVE_TIMEOUT` sets the HTTP keep-alive timeout in seconds, default 5, for deployments behind a load balancer with a longer idle timeout.

### Changed

- XRP `BalanceDecreasingTransaction` derives `standardPaymentReference` the same way as `Payment` and `XRPPaymentNonexistence`. The change applies to XRP transactions from the start of Flare voting round 1508840 (2026-11-09 12:00 UTC) on mainnet and the start of Coston2 voting round 1492660 (2026-10-23 15:30 UTC) on testnet. All providers must run this version before then.
- **Breaking**: EVM `GET /api/health` now returns an `ApiResponseWrapper` with the chain tip block, matching the indexer verifiers, instead of a bare `true`.

### Removed

- **Breaking**: removed the `web2` verifier type and `Web2Json` attestation type support from this repository. `VERIFIER_TYPE=web2` now fails at startup.

### Security

- TLS connections reject certificates issued under the eight compromised eMudhra (emSign) intermediate CA keys, whichever root they chain to.

## [1.6.1] - 2026-06-05

### Changed

- `Web2Json` responses keep `lowestUsedTimestamp` at 0 until 2026-06-16 09:00 UTC (1781600400) and use the max-uint64 value from then on.

## [1.6.0] - 2026-06-01

### Changed

- `ConfirmedBlockHeightExists` on BTC and DOGE uses the lowest block of the query window as `lowestUsedTimestamp` for blocks from 2026-06-16 09:00 UTC (1781600400) on mainnet and from 2026-06-01 09:00 UTC (1780304400) on testnet.
- XRP counts a payment as native only when both the delivered amount and the sent amount are XRP and the payment is not a partial payment. `Payment` and `ReferencedPaymentNonexistence` no longer accept cross-currency payments that deliver XRP.
- XRP `standardPaymentReference` is zero when the memo is not a 32-byte hex value. The memo is no longer decoded as text.
- XRP transaction status recognises newer rippled `tec` result codes as sender failures.
- `Web2Json` valid responses report the max-uint64 value as `lowestUsedTimestamp` instead of 0.

### Security

- `Web2Json`: jq `as` declarations are rejected, so they cannot bypass the function allowlist.

## [1.5.0] - 2026-04-17

### Added

- Added `XRPPayment` and `XRPPaymentNonexistence` attestation types to XRP verifiers.
- Added `BASE` and `HYPE` as supported EVM verifier types.

### Fixed

- XRP response timestamps (`blockTimestamp`, `lowestUsedTimestamp`) no longer add the Ripple epoch offset twice, for transactions from 2026-04-28 09:00 UTC (1777366800). Earlier transactions keep the previous value.
- `ConfirmedBlockHeightExists` uses the lowest block of the query window as `lowestUsedTimestamp`, for blocks from 2026-04-28 09:00 UTC (1777366800).
- `ReferencedPaymentNonexistence` returns `DATA_AVAILABILITY_FAILURE` when the scanned range reaches past the last confirmed block.
- `AddressValidity` accepts 35-character base58 addresses, which covers all testnet P2SH addresses.
- `AddressValidity` rejects segwit addresses outside 14 to 74 characters, with invalid padding, or with a version 1 program that is not 32 bytes.

### Changed

- **Breaking**: XRP verifiers read the transaction status, destination address hash and intended receiving amount from the indexer and need verifier-xrp-indexer 2.0.0 or later.
- Changed url paths for all EVM types to make them consistent with other non-EVM types - `/EVMTransaction` without a chain prefix.

### Removed

- Removed the deprecated `POST /<AttestationType>` root verify endpoint from all verifiers. Use `POST /<AttestationType>/verifyFDC` instead.

### Security

- `Web2Json`: stricter checks that block private and reserved IP addresses.

## [1.4.0] - 2026-03-03

### Added

- `Web2Json`: added `PublicWeb2` source support, allows calling any public Web2 endpoint. Only available on testnets.
- `Web2Json`: added `tonumber` jq function support.
- Migrated `evm` verifier type with `EVMTransaction` attestation type support into this repository from the [evm-verifier](https://gitlab.com/flarenetwork/fdc/evm-verifier) repository, which is now deprecated.

### Changed

- `Web2Json`: removed `testApis` source, use `PublicWeb2` instead.
- Bumped required Node.js version to 24 (lts/krypton).
- Switched to using pnpm for package management instead of yarn.

## [1.3.1] - 2026-01-08

### Fixed

- Graceful handling of invalid `Web2Json` attestation requests.

## [1.3.0] - 2025-12-16

### Added

- `Web2Json` attestation type support.

### Changed

- All `AddressValidity` attestation type requests will now result in `VALID` top-level response status.
