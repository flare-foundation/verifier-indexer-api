# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `Web2Json`: added `PublicWeb2` source support, allows calling any public Web2 endpoint. Only available on testnets.

### Changed

- `Web2Json`: removed `testApis` source, use `PublicWeb2` instead.
- Bumped required Node.js version to 24 (lts/krypton).

## [1.3.1] - 2026-01-08

### Fixed

- Graceful handling of invalid `Web2Json` attestation requests.

## [1.3.0] - 2025-12-16

### Added

- `Web2Json` attestation type support.

### Changed

- All `AddressValidity` attestation type requests will now result in `VALID` top-level response status.