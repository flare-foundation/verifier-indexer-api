#!/usr/bin/env ts-node
import 'dotenv/config';
import { ethers } from 'ethers';
import { createDecipheriv, createECDH, hkdfSync } from 'crypto';
import { config as loadEnv } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load dedicated env file for decryption, next to this script
loadEnv({ path: resolve(__dirname, '.env.decrypt') });

const ENV_KEY = 'PRIVATE_KEY';
const INPUT_FILE = 'ignite-api-keys.json';

const ECDH_SALT = Buffer.from('key-publish-ecdh-salt-v1');
const ECDH_INFO_PREFIX = Buffer.from('key-publish-api-key:v1:');
const AES_NONCE_SIZE = 12;
const AUTH_TAG_SIZE = 16;

interface EncryptedKeyRecord {
  signing_policy_address: string;
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

function loadAllKeysFromFile(): EncryptedKeyRecord[] {
  const filePath = resolve(__dirname, INPUT_FILE);
  const raw = readFileSync(filePath, { encoding: 'utf8' });
  const parsed = JSON.parse(raw) as any;

  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.data)) {
    throw new Error(
      `Input file ${INPUT_FILE} does not contain a 'data' array.`,
    );
  }

  return parsed.data as EncryptedKeyRecord[];
}

function findRecordForAddress(
  records: EncryptedKeyRecord[],
  myAddress: string,
): string | undefined {
  const target = myAddress.toLowerCase();
  for (const item of records) {
    const addr = item.signing_policy_address?.toString();
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

    console.log(`Decrypting key for signing policy address: ${myAddress}`);
    console.log(`Reading keys from file: ${INPUT_FILE}`);

    const records = loadAllKeysFromFile();
    const encryptedKey = findRecordForAddress(records, myAddress);

    if (!encryptedKey) {
      throw new Error(`No encrypted key found for address ${myAddress}.`);
    }

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
