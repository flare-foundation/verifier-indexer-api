# Obtaining Web2Json Ignite Source API Key

API keys for the Ignite proxy are issued separately to each registered data provider.
Each key is encrypted with that provider's signing policy public key and then published as part of a global list at:
- Flare: https://api.ignitemarket.xyz/proxy-api-keys
- Songbird: https://api.ignitemarket.xyz/proxy-api-keys/songbird

The steps below show how to decrypt and obtain your own provider's API key.

## Setup

From the project root run:

```bash
yarn install
```

Create a `.env.decrypt` file in `scripts/web2/` with:

```bash
PRIVATE_KEY=0x...
```

- `PRIVATE_KEY`: your provider's signing policy private key in hex format.

## Step 1: Fetch encrypted keys

From `scripts/web2/`, run:

```bash
curl -s "https://api.ignitemarket.xyz/proxy-api-keys" -o ignite-api-keys.json
```

## Step 2: Decrypt your API key

From `scripts/web2/`, run:

```bash
npx ts-node decrypt-ignite-key.ts
```

This will:

1. Load `PRIVATE_KEY` from `.env.decrypt`.
2. Read the full keys JSON file (`ignite-api-keys.json`).
3. Filter find entry matching your signing policy address derived from `PRIVATE_KEY`.
4. Decrypt the API key.
5. Print the decrypted API key to stdout.
