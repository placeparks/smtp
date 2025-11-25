# Quick DNS Setup Reference

## Quick Start: 5 Minutes

### 1. Generate DKIM Keys
```bash
cd server
node scripts/generate-dkim-keys.js
```

### 2. Set Environment Variables (Railway/Heroku)
```bash
DKIM_DOMAIN=miracmail.com
DKIM_SELECTOR=default
DKIM_PRIVATE_KEY="(paste private key from script output)"
```

### 3. Add DNS Records

Go to your domain registrar and add these 4 records:

#### SPF (TXT Record)
```
Host: @
Value: v=spf1 include:railway.app ~all
```

#### DKIM (TXT Record)
```
Host: default._domainkey
Value: v=DKIM1; k=rsa; p=(public key from script)
```

#### DMARC (TXT Record)
```
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@miracmail.com
```

#### MX (For Receiving)
```
Host: @
Value: your-app.up.railway.app
Priority: 10
```

### 4. Wait & Test
- Wait 1-24 hours for DNS propagation
- Send test email
- Check headers for SPF/DKIM/DMARC: PASS
- Test at [mail-tester.com](https://www.mail-tester.com)

---

## That's It! 🎉

See `SPF_DKIM_DMARC_SETUP.md` for detailed instructions.

