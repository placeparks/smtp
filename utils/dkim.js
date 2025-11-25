// DKIM Key Generation and Configuration
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Generate DKIM private and public keys
 * Run this once to generate keys, then add the public key to DNS
 */
function generateDKIMKeys() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    // Extract public key without headers for DNS
    const publicKeyForDNS = publicKey
        .replace(/-----BEGIN PUBLIC KEY-----/g, '')
        .replace(/-----END PUBLIC KEY-----/g, '')
        .replace(/\n/g, '');

    return {
        privateKey,
        publicKey,
        publicKeyForDNS
    };
}

/**
 * Save DKIM keys to files (optional - for persistence)
 */
function saveDKIMKeys(domain, selector = 'default') {
    const keys = generateDKIMKeys();
    const keysDir = path.join(__dirname, '../keys');
    
    // Create keys directory if it doesn't exist
    if (!fs.existsSync(keysDir)) {
        fs.mkdirSync(keysDir, { recursive: true });
    }

    const privateKeyPath = path.join(keysDir, `${domain}-${selector}-private.pem`);
    const publicKeyPath = path.join(keysDir, `${domain}-${selector}-public.pem`);

    fs.writeFileSync(privateKeyPath, keys.privateKey);
    fs.writeFileSync(publicKeyPath, keys.publicKey);

    console.log('\n✅ DKIM Keys Generated!');
    console.log(`\nPrivate Key saved to: ${privateKeyPath}`);
    console.log(`Public Key saved to: ${publicKeyPath}`);
    console.log('\n📋 Add this to your DNS (TXT record):');
    console.log(`\nHost: ${selector}._domainkey`);
    console.log(`Value: v=DKIM1; k=rsa; p=${keys.publicKeyForDNS}`);
    console.log('\n⚠️  Keep your private key secure! Never commit it to git.\n');

    return keys;
}

/**
 * Get DKIM configuration for nodemailer
 */
function getDKIMConfig() {
    // Get DKIM settings from environment variables
    const domain = process.env.DKIM_DOMAIN;
    const selector = process.env.DKIM_SELECTOR || 'default';
    const privateKey = process.env.DKIM_PRIVATE_KEY;

    if (!domain || !privateKey) {
        return null; // DKIM not configured
    }

    return {
        domainName: domain,
        keySelector: selector,
        privateKey: privateKey.replace(/\\n/g, '\n') // Handle newlines in env var
    };
}

module.exports = {
    generateDKIMKeys,
    saveDKIMKeys,
    getDKIMConfig
};

