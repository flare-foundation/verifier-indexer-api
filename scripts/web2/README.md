# Ignite API Key Decryption example

This is a sample script demonstrating how to decrypt your Ignite proxy API key using your provider's signing policy private key.

## Setup

From the project root:

```bash
yarn install
```

Create a `.env.decrypt` file in `scripts/web2/` with:

```bash
PRIVATE_KEY=0x...
KEYS_URL=https://api.ignitemarket.xyz/proxy-api-keys
```

- `PRIVATE_KEY`: your provider's signing policy private key in hex format.
- `KEYS_URL`: endpoint with published API keys, defaults to: `https://api.ignitemarket.xyz/proxy-api-keys`.

## Usage

From the project root, run:

```bash
cd scripts/web2
npx ts-node decrypt-ignite-key.ts
```

The script will:

1. Load `PRIVATE_KEY` (and optionally `KEYS_URL`) from `.env.decrypt`.
2. Derive your signing policy address from `PRIVATE_KEY`.
3. Fetch encrypted API keys from `KEYS_URL`.
4. Find the entry matching your address.
5. Decrypt the API key and print it to stdout.
