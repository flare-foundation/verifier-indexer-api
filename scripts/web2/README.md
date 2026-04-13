# Obtaining Web2Json Ignite Source API Key

API keys for the Ignite proxy are issued separately to each registered data provider.
Each key is encrypted with that provider's signing policy public key and then published as part of a global list at:
- Flare: https://api.ignitemarket.xyz/proxy-api-keys
- Songbird: https://api.ignitemarket.xyz/proxy-api-keys/songbird

The steps below show how to decrypt and obtain your own provider's API key.

## Step 1: Fetch encrypted keys

```bash
curl -s "https://api.ignitemarket.xyz/proxy-api-keys" -o scripts/web2/ignite-api-keys.json
```

For Songbird:
```bash
curl -s "https://api.ignitemarket.xyz/proxy-api-keys/songbird" -o scripts/web2/ignite-api-keys.json
```

## Step 2: Decrypt your API key

```bash
node --permission --allow-fs-read='./scripts/web2/*' scripts/web2/decrypt-ignite-key.mjs
```

The script prompts for your signing policy private key with hidden input. The key is not stored in shell history or environment variables.
The `--permission` flag (Node 22+) blocks all network access, child processes, and filesystem writes — only reads from the script's directory are allowed.

The script uses only Node.js built-in modules (`node:crypto`, `node:fs`) and requires no `pnpm install`.
