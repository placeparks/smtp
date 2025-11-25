// Script to generate DKIM keys
// Run: node scripts/generate-dkim-keys.js

const { saveDKIMKeys } = require('../utils/dkim');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🔐 DKIM Key Generator\n');
console.log('This will generate RSA keys for DKIM email signing.\n');

rl.question('Enter your domain (e.g., miracmail.com): ', (domain) => {
    rl.question('Enter selector (default: default): ', (selector) => {
        const finalSelector = selector.trim() || 'default';
        
        try {
            const keys = saveDKIMKeys(domain.trim(), finalSelector);
            
            console.log('\n📝 Next Steps:');
            console.log('1. Add the DNS TXT record shown above');
            console.log('2. Set environment variables:');
            console.log(`   DKIM_DOMAIN=${domain.trim()}`);
            console.log(`   DKIM_SELECTOR=${finalSelector}`);
            console.log(`   DKIM_PRIVATE_KEY="(paste private key here)"`);
            console.log('\n3. Wait for DNS propagation (can take up to 24 hours)');
            console.log('4. Test with: https://www.mail-tester.com\n');
            
        } catch (error) {
            console.error('❌ Error generating keys:', error.message);
        }
        
        rl.close();
    });
});

