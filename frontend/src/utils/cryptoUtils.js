/**
 * 🔒 Web Crypto API Utilities for AES-256-GCM Zero-Knowledge Encryption
 * 
 * Features:
 * - Hardware-accelerated native Web Crypto API (window.crypto.subtle)
 * - PBKDF2 Key Derivation (100,000 SHA-256 iterations)
 * - AES-256-GCM Authenticated Encryption with 96-bit random IVs
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */

const SALT = 'NaqashlyMindVaultSalt2026';

// 1. Derive AES-GCM Key from User Passphrase
export const deriveAESKey = async (passphrase) => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(SALT),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// 2. Encrypt Plaintext to Encrypted String (IV_HEX:CIPHER_HEX)
export const encryptAES256 = async (plaintext, passphrase) => {
  try {
    const aesKey = await deriveAESKey(passphrase);
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      enc.encode(plaintext)
    );

    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const cipherHex = Array.from(new Uint8Array(ciphertextBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    return `${ivHex}:${cipherHex}`;
  } catch (err) {
    console.error('[CryptoUtils] Encryption failed:', err);
    throw new Error('Encryption failed. Check Web Crypto API support.');
  }
};

// 3. Decrypt Encrypted String (IV_HEX:CIPHER_HEX) to Plaintext
export const decryptAES256 = async (encryptedString, passphrase) => {
  try {
    if (!encryptedString || !encryptedString.includes(':')) {
      return encryptedString; // Return unencrypted if plain
    }

    const [ivHex, cipherHex] = encryptedString.split(':');
    const iv = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const cipherBuffer = new Uint8Array(cipherHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    const aesKey = await deriveAESKey(passphrase);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      cipherBuffer
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (err) {
    console.warn('[CryptoUtils] Decryption failed (Wrong passphrase or corrupted cipher):', err);
    return null; // Signals wrong passphrase
  }
};
