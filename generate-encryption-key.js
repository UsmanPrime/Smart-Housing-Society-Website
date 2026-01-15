#!/usr/bin/env node

/**
 * Generate Encryption Key for Phase 3
 * 
 * This script generates a cryptographically secure 256-bit (32-byte) encryption key
 * for use with the AES-256-GCM encryption service.
 * 
 * Usage:
 *   node generate-encryption-key.js
 * 
 * Output: 64 hexadecimal characters (32 bytes)
 * Add to server/.env as: ENCRYPTION_KEY=<generated-key>
 */

const crypto = require('crypto');

console.log('\n=== Encryption Key Generator ===\n');

// Generate 32 bytes (256 bits) of random data
const key = crypto.randomBytes(32).toString('hex');

console.log('Your new encryption key:\n');
console.log(key);
console.log('\nAdd this to your server/.env file:');
console.log(`ENCRYPTION_KEY=${key}`);

console.log('\n⚠️  IMPORTANT:');
console.log('1. Keep this key SECRET');
console.log('2. DO NOT commit it to version control');
console.log('3. DO NOT change it after encrypting data (data will be unreadable)');
console.log('4. Store it securely (password manager, secrets vault)');
console.log('5. Use different keys for development and production\n');

// Verify key length
if (key.length === 64) {
  console.log('✅ Key generated successfully (64 characters)\n');
} else {
  console.log('❌ Error: Key length incorrect\n');
}
