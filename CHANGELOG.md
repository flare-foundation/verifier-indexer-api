# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.5.0] - 2026-04-17

### Added

- Added `BASE` and `HYPE` as supported EVM verifier types.

### Fixed

- `XRPPaymentNonexistence`: use intended receiving address hash instead of actual in post-SQL verification, so RECEIVER_FAILURE transactions correctly disprove nonexistence.
- Added explicit `bigint` type to `intended_receiving_amount` TypeORM column to match the actual database schema.
- `ReferencedPaymentNonexistence`: reject the request with `DATA_AVAILABILITY_FAILURE` when the scan range extends past the indexer's `state.last_indexed_block_number`, enforcing the spec requirement that the verifier has full visibility of the scan range before attesting nonexistence.

### Changed

- Changed url paths for all EVM types to make them consistent with other non-EVM types - `/EVMTransaction` without a chain prefix.
- `XRPPayment` transaction `date`: gated behind a 2026-04-28 11:00:00 CEST hard fork. Pre-fork blocks subtract `XRP_UTD` to preserve historical attestations; post-fork blocks pass `transaction.timestamp` unchanged.
- `ConfirmedBlockHeightExists` LUT: gated behind the same 2026-04-28 11:00:00 CEST hard fork. Pre-fork uses `dbBlock.timestamp` deterministically; post-fork uses `lowerQueryWindowBlock.timestamp`.

### Removed

- Removed the deprecated `POST /<AttestationType>` root verify endpoint from all verifiers. Use `POST /<AttestationType>/verifyFDC` instead.

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
