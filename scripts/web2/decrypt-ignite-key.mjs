#!/usr/bin/env node
import { createDecipheriv, createECDH, hkdfSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { stdin, stdout } from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ECDH_SALT = Buffer.from('key-publish-ecdh-salt-v1');
const ECDH_INFO_PREFIX = Buffer.from('key-publish-api-key:v1:');
const AES_NONCE_SIZE = 12;
const AUTH_TAG_SIZE = 16;

async function promptHidden(prompt) {
  if (!stdin.isTTY || !stdout.isTTY || typeof stdin.setRawMode !== 'function') {
    throw new Error(
      'Interactive TTY required. Run this script from a terminal session.',
    );
  }

  stdout.write(prompt);
  stdin.setEncoding('utf8');
  stdin.setRawMode(true);
  stdin.resume();

  return await new Promise((resolve, reject) => {
    let value = '';

    const cleanup = () => {
      stdin.removeListener('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
    };

    const onData = (chunk) => {
      const text = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
      for (const ch of text) {
        if (ch === '\r' || ch === '\n') {
          cleanup();
          stdout.write('\n');
          resolve(value);
          return;
        }
        if (ch === '\u0003') {
          cleanup();
          stdout.write('\n');
          reject(new Error('Input cancelled by user.'));
          return;
        }
        if (ch === '\u007f' || ch === '\b' || ch === '\x08') {
          if (value.length > 0) {
            value = value.slice(0, -1);
          }
          continue;
        }
        value += ch;
      }
    };

    stdin.on('data', onData);
  });
}

async function loadPrivateKey() {
  const raw = await promptHidden('Signing policy private key: ');
  let s = raw.trim().toLowerCase();
  if (s.startsWith('0x')) s = s.slice(2);
  if (!/^[0-9a-f]{64}$/.test(s)) {
    throw new Error('PRIVATE_KEY must be a 32-byte hex string.');
  }
  return Buffer.from(s, 'hex');
}

function decrypt(privateKey, signingAddress, encryptedB64) {
  const payload = Buffer.from(encryptedB64, 'base64');
  if (payload.length <= 65 + AES_NONCE_SIZE + AUTH_TAG_SIZE) {
    throw new Error('Encrypted payload too short');
  }

  const ephPub = payload.subarray(0, 65);
  const nonce = payload.subarray(65, 65 + AES_NONCE_SIZE);
  const ciphertext = payload.subarray(65 + AES_NONCE_SIZE, -AUTH_TAG_SIZE);
  const authTag = payload.subarray(-AUTH_TAG_SIZE);

  const ecdh = createECDH('secp256k1');
  ecdh.setPrivateKey(privateKey);
  const shared = ecdh.computeSecret(ephPub);
  let aesKey;

  try {
    const info = Buffer.concat([
      ECDH_INFO_PREFIX,
      Buffer.from(signingAddress, 'utf8'),
    ]);
    aesKey = Buffer.from(hkdfSync('sha256', shared, ECDH_SALT, info, 32));

    const decipher = createDecipheriv('aes-256-gcm', aesKey, nonce);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString(
      'utf8',
    );
  } finally {
    shared.fill(0);
    if (aesKey) {
      aesKey.fill(0);
    }
  }
}

// Derive Ethereum address requires keccak-256 which Node.js doesn't expose,
// so we try decrypting each record until one's auth tag validates.
function findAndDecrypt(records, privateKey) {
  for (const item of records) {
    const addr = item?.signing_policy_address?.toString();
    const enc = item?.encrypted_API_key?.toString();
    if (!addr || !enc) continue;

    try {
      return { signingAddress: addr, apiKey: decrypt(privateKey, addr, enc) };
    } catch {
      // Auth tag mismatch — not our record, keep going.
    }
  }
  return undefined;
}

async function main() {
  let privateKey;
  try {
    privateKey = await loadPrivateKey();
    const file = readFileSync(resolve(__dirname, 'ignite-api-keys.json'), 'utf8');
    const records = JSON.parse(file)?.data;

    if (!Array.isArray(records)) {
      throw new Error('ignite-api-keys.json does not contain a "data" array.');
    }

    const match = findAndDecrypt(records, privateKey);
    if (!match) {
      throw new Error('No decryptable entry found for this private key.');
    }

    console.log(`Signing policy address: ${match.signingAddress}`);
    console.log(match.apiKey);
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    if (privateKey) {
      privateKey.fill(0);
    }
  }
}

void main();
