#!/usr/bin/env ts-node
import 'dotenv/config';
import axios from 'axios';
import { ethers } from 'ethers';
import { createDecipheriv, createECDH, hkdfSync } from 'crypto';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

// Load dedicated env file for decryption, next to this script
loadEnv({ path: resolve(__dirname, '.env.decrypt') });

const KEYS_URL =
  process.env.KEYS_URL || 'https://api.ignitemarket.xyz/proxy-api-keys';
const ENV_KEY = 'PRIVATE_KEY';

const ECDH_SALT = Buffer.from('key-publish-ecdh-salt-v1');
const ECDH_INFO_PREFIX = Buffer.from('key-publish-api-key:v1:');
const AES_NONCE_SIZE = 12;
const AUTH_TAG_SIZE = 16;

interface EncryptedKeyRecord {
  signing_address?: string;
  identity_address?: string;
  encrypted_API_key: string;
}

function loadPrivateKeyFromEnv(): string {
  const hexKeyRaw = process.env[ENV_KEY];
  if (!hexKeyRaw) {
    throw new Error(`Key '${ENV_KEY}' not found in environment.`);
  }

  let s = hexKeyRaw.trim().toLowerCase();
  if (s.startsWith('0x')) {
    s = s.slice(2);
  }
  if (!/^[0-9a-f]+$/.test(s)) {
    throw new Error('PRIVATE_KEY in env is not a valid hex string.');
  }
  return '0x' + s;
}

function deriveSharedSecret(
  privateKeyHex: string,
  ephPubKeyBytes: Buffer,
): Buffer {
  if (ephPubKeyBytes.length !== 65 || ephPubKeyBytes[0] !== 0x04) {
    throw new Error('Ephemeral public key is not in uncompressed 65-byte form');
  }

  const ecdh = createECDH('secp256k1');
  ecdh.setPrivateKey(Buffer.from(privateKeyHex.slice(2), 'hex'));
  // ephPubKeyBytes is the uncompressed point (0x04 || X || Y)
  return ecdh.computeSecret(ephPubKeyBytes);
}

function hkdfSha256(secret: Buffer, info: Buffer): Buffer {
  return Buffer.from(hkdfSync('sha256', secret, ECDH_SALT, info, 32));
}

function decryptIgniteKey(
  privateKeyHex: string,
  signingAddress: string,
  encryptedB64: string,
): string {
  const payload = Buffer.from(encryptedB64, 'base64');
  if (payload.length <= 65 + AES_NONCE_SIZE + AUTH_TAG_SIZE) {
    throw new Error('Encrypted payload too short');
  }

  const ephBytes = payload.subarray(0, 65);
  const nonce = payload.subarray(65, 65 + AES_NONCE_SIZE);
  const cipherAndTag = payload.subarray(65 + AES_NONCE_SIZE);

  if (ephBytes[0] !== 0x04 || ephBytes.length !== 65) {
    throw new Error('Ephemeral public key is not in uncompressed 65-byte form');
  }

  if (cipherAndTag.length <= AUTH_TAG_SIZE) {
    throw new Error('Ciphertext plus tag too short');
  }

  const ciphertext = cipherAndTag.subarray(
    0,
    cipherAndTag.length - AUTH_TAG_SIZE,
  );
  const authTag = cipherAndTag.subarray(cipherAndTag.length - AUTH_TAG_SIZE);
  const sharedSecret = deriveSharedSecret(privateKeyHex, ephBytes);

  const info = Buffer.concat([
    ECDH_INFO_PREFIX,
    Buffer.from(signingAddress, 'utf8'),
  ]);

  const aesKey = hkdfSha256(sharedSecret, info);

  try {
    const decipher = createDecipheriv('aes-256-gcm', aesKey, nonce);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch (err: any) {
    throw new Error('Decryption failed: Authentication tag is invalid.');
  }
}

async function fetchEncryptedKeys(): Promise<EncryptedKeyRecord[]> {
  const resp = await axios.get(KEYS_URL, { timeout: 10_000 });
  const data = resp.data;
  if (!data || typeof data !== 'object' || !Array.isArray(data.data)) {
    throw new Error('API response is not in the expected format.');
  }
  return data.data as EncryptedKeyRecord[];
}

function findEncryptedKeyForAddress(
  records: EncryptedKeyRecord[],
  myAddress: string,
): string | undefined {
  const target = myAddress.toLowerCase();
  for (const item of records) {
    const addr = (
      item.signing_address ||
      item.identity_address ||
      ''
    ).toString();
    if (addr && addr.toLowerCase() === target) {
      return item.encrypted_API_key;
    }
  }
  return undefined;
}

async function main(): Promise<void> {
  try {
    const privateKeyHex = loadPrivateKeyFromEnv();
    const wallet = new ethers.Wallet(privateKeyHex);
    const myAddress = wallet.address;

    console.log(`Derived signing policy address: ${myAddress}`);

    const records = await fetchEncryptedKeys();
    const encryptedKey = findEncryptedKeyForAddress(records, myAddress);

    if (!encryptedKey) {
      throw new Error(`No encrypted key found for address ${myAddress}.`);
    }
    console.log('Found encrypted key. Decrypting...');

    const apiKey = decryptIgniteKey(privateKeyHex, myAddress, encryptedKey);

    console.log('\nSuccessfully decrypted API Key:');
    console.log(apiKey);
  } catch (err: any) {
    console.error(err?.message || String(err));
    process.exitCode = 1;
  }
}

if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  main();
}
