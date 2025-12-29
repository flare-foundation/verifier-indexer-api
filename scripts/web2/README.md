# Ignite Proxy API Key Decryption example

This is a sample script demonstrating how to obtain your Ignite proxy API key.

## Setup

From the project root:

```bash
yarn install
```

Create a `.env.decrypt` file in `scripts/web2/` with:

```bash
PRIVATE_KEY=0x...
```

- `PRIVATE_KEY`: your provider's signing policy private key in hex format.

## Step 1: Fetch encrypted keys list

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
