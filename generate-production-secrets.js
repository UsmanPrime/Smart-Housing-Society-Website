#!/usr/bin/env node
/**
 * Generate Production Secrets
 * Generates all required secrets for production deployment
 */

import crypto from 'crypto';

console.log('\n🔐 Generating Production Secrets for Deployment\n');
console.log('=' .repeat(70));

// 1. Encryption Key (64 characters)
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('\n1. ENCRYPTION_KEY (64 characters):');
console.log('   Copy this to Render Environment Variables');
console.log('   ─'.repeat(70));
console.log(`   ${encryptionKey}`);

// 2. JWT Secret (128 characters)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('\n2. JWT_SECRET (128 characters):');
console.log('   Copy this to Render Environment Variables');
console.log('   ─'.repeat(70));
console.log(`   ${jwtSecret}`);

// 3. JWT Refresh Secret (128 characters, different from JWT_SECRET)
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
console.log('\n3. JWT_REFRESH_SECRET (128 characters):');
console.log('   Copy this to Render Environment Variables');
console.log('   ⚠️  MUST be different from JWT_SECRET');
console.log('   ─'.repeat(70));
console.log(`   ${jwtRefreshSecret}`);

// Summary
console.log('\n' + '='.repeat(70));
console.log('\n✅ All secrets generated successfully!\n');
console.log('📋 Next Steps:\n');
console.log('1. Go to Render Dashboard → Your Service → Environment');
console.log('2. Add these three environment variables:');
console.log('   - ENCRYPTION_KEY');
console.log('   - JWT_SECRET');
console.log('   - JWT_REFRESH_SECRET');
console.log('3. Copy-paste the values above (NOT the labels)');
console.log('4. Save changes in Render (will trigger redeploy)');
console.log('\n⚠️  Security Reminder:');
console.log('   - Do NOT commit these secrets to Git');
console.log('   - Do NOT share these secrets');
console.log('   - Do NOT reuse development secrets in production');
console.log('   - Store these securely (password manager recommended)');
console.log('\n' + '='.repeat(70) + '\n');

// Optional: Create a template file (commented out by default)
const createTemplateFile = process.argv.includes('--save');

if (createTemplateFile) {
  import('fs').then(fs => {
    const template = `# Production Secrets - Generated ${new Date().toISOString()}
# ⚠️ DO NOT COMMIT THIS FILE TO GIT!

ENCRYPTION_KEY=${encryptionKey}
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}

# Copy these to Render Dashboard → Environment Variables
# Then DELETE this file for security
`;

    fs.writeFileSync('.secrets.production.txt', template);
    console.log('📝 Secrets saved to: .secrets.production.txt');
    console.log('⚠️  Remember to DELETE this file after copying to Render!\n');
  });
}
