<!-- LOGO -->
<div align="center">
  <a href="https://flare.network/" target="blank">
    <img src="https://content.flare.network/Flare-2.svg" width="300" alt="Flare Logo" />
  </a>
  <br />
  <a href="CONTRIBUTING.md">Contributing</a>
  ·
  <a href="SECURITY.md">Security</a>
  ·
  <a href="CHANGELOG.md">Changelog</a>
</div>

# FDC Attestation Verifier

A microservice in the Flare Data Connector (FDC) suite responsible for verifying and executing attestation requests and
providing ABI-encoded responses.

It can be configured to run one of the supported attestation type and source combination verifications.

See documentation for more attestation type details: https://dev.flare.network/fdc/attestation-types/ 

## Blockchain data attestations

Supported attestation types:

- `AddressValidity`
- `Payment`
- `BalanceDecreasingTransaction`
- `ReferencedPaymentNonexistence`
- `ConfirmedBlockHeightExists`

Supported sources:
- Mainnet: `BTC`, `DOGE`, `XRPL`
- Testnet: `testBTC`, `testDOGE`, `testXRP`

For these attestation types the verifier requires access to blockchain indexers writing to PostgreSQL backends (fully synced to the target network).

## Web2 data attestations

Supported attestation type: `Web2Json`

Supported sources:
- Mainnet: [web2-json-sources.ts](src/config/web2/web2-json-sources.ts)
- Testnet: [web2-json-test-sources.ts](src/config/web2/web2-json-test-sources.ts)

Web2 data attestations fetch and transform JSON data from HTTP(S) endpoints using jq queries. Allowed endpoints are defined by the source configuration files above.