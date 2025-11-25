# SPF/DKIM/DMARC Setup Guide

This guide will help you set up email authentication (SPF, DKIM, DMARC) for your custom SMTP server to build email reputation and work with services like TikTok.

---

## Overview

### What These Records Do:

- **SPF (Sender Policy Framework)**: Tells other servers which servers are allowed to send emails for your domain
- **DKIM (DomainKeys Identified Mail)**: Cryptographically signs your emails to prove authenticity
- **DMARC (Domain-based Message Authentication)**: Policy for handling emails that fail SPF/DKIM checks

### Why You Need Them:

- ✅ Build email reputation
- ✅ Prevent emails from going to spam
- ✅ Work with services like TikTok, Instagram, etc.
- ✅ Increase email deliverability

---

## Step 1: Generate DKIM Keys

### Option A: Using the Script (Recommended)

```bash
cd server
node scripts/generate-dkim-keys.js
```

Follow the prompts:
1. Enter your domain: `miracmail.com`
2. Enter selector: `default` (or any name you prefer)

This will:
- Generate RSA key pair
- Save keys to `server/keys/` directory
- Display the DNS record you need to add

### Option B: Manual Generation

```bash
# Generate private key
openssl genrsa -out private-key.pem 2048

# Generate public key
openssl rsa -in private-key.pem -pubout -out public-key.pem

# Extract public key for DNS (remove headers)
cat public-key.pem | grep -v "BEGIN\|END" | tr -d '\n'
```

---

## Step 2: Set Environment Variables

Add these to your Railway/Heroku environment variables:

```bash
# Your domain
DKIM_DOMAIN=miracmail.com

# Selector (same as used in DNS)
DKIM_SELECTOR=default

# Private key (paste the entire private key, including BEGIN/END lines)
DKIM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----"
```

**Important**: 
- Keep private key secure
- Never commit to git
- Use environment variables only
- Replace `\n` with actual newlines in the key

---

## Step 3: Configure DNS Records

Add these DNS records to your domain registrar (where you bought `miracmail.com`):

### 1. SPF Record (TXT)

**Purpose**: Authorizes your SMTP server to send emails

```
Type: TXT
Host: @
Value: v=spf1 ip4:YOUR_RAILWAY_IP include:railway.app ~all
TTL: 3600
```

**To get your Railway IP:**
```bash
# Check Railway logs or use:
nslookup your-app.up.railway.app
```

**Alternative (if Railway provides IP):**
```
v=spf1 include:railway.app ~all
```

**Example:**
```
v=spf1 ip4:52.1.2.3 include:railway.app ~all
```

---

### 2. DKIM Record (TXT)

**Purpose**: Signs your emails cryptographically

```
Type: TXT
Host: default._domainkey
Value: v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY_HERE
TTL: 3600
```

**Get the public key from:**
- The script output (when you ran `generate-dkim-keys.js`)
- Or from `server/keys/your-domain-default-public.pem` (remove headers)

**Example:**
```
v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1234567890abcdef...
```

**Note**: The public key should be one continuous string (no spaces, no line breaks)

---

### 3. DMARC Record (TXT)

**Purpose**: Policy for handling failed authentication

```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@miracmail.com; ruf=mailto:admin@miracmail.com; pct=100
TTL: 3600
```

**Policy Options:**
- `p=none` - Monitor only (start here)
- `p=quarantine` - Send to spam folder
- `p=reject` - Reject emails (use after testing)

**Start with `p=none`** to monitor, then change to `p=quarantine` or `p=reject` after confirming everything works.

---

### 4. MX Record (For Receiving)

**Purpose**: Tells servers where to send emails for your domain

```
Type: MX
Host: @
Value: your-app.up.railway.app
Priority: 10
TTL: 3600
```

**If Railway assigns a different port:**
```
Value: your-app.up.railway.app:587
```

---

## Step 4: Verify DNS Records

### Check SPF:
```bash
nslookup -type=TXT miracmail.com
# Should show: v=spf1 ...
```

### Check DKIM:
```bash
nslookup -type=TXT default._domainkey.miracmail.com
# Should show: v=DKIM1; k=rsa; p=...
```

### Check DMARC:
```bash
nslookup -type=TXT _dmarc.miracmail.com
# Should show: v=DMARC1; ...
```

### Online Tools:
- [MXToolbox](https://mxtoolbox.com/) - Check all records
- [DKIM Validator](https://dkimvalidator.com/) - Test DKIM
- [DMARC Analyzer](https://dmarcian.com/dmarc-xml/) - Analyze DMARC

---

## Step 5: Test Email Authentication

### 1. Send a Test Email

Send an email from your app to a test address (like Gmail).

### 2. Check Email Headers

In Gmail:
1. Open the email
2. Click "Show original" (three dots menu)
3. Look for:
   - `SPF: PASS`
   - `DKIM: PASS`
   - `DMARC: PASS`

### 3. Use Mail-Tester

1. Go to [mail-tester.com](https://www.mail-tester.com)
2. Get a test email address
3. Send an email to that address
4. Check your score (aim for 8+/10)

---

## Step 6: Monitor and Improve

### Check DMARC Reports

If you set `rua=mailto:admin@miracmail.com`, you'll receive DMARC reports showing:
- Which emails passed/failed
- Sources of emails
- Authentication results

### Gradually Tighten Policy

1. **Week 1**: `p=none` (monitor only)
2. **Week 2-3**: Review reports, fix issues
3. **Week 4**: Change to `p=quarantine` (send to spam)
4. **Week 5+**: Change to `p=reject` (reject emails)

---

## Troubleshooting

### DKIM Not Working

**Problem**: Emails show "DKIM: FAIL"

**Solutions**:
1. Check DNS record is correct (no spaces in public key)
2. Verify private key matches public key
3. Ensure environment variables are set correctly
4. Wait for DNS propagation (up to 24 hours)

### SPF Not Working

**Problem**: Emails show "SPF: FAIL"

**Solutions**:
1. Verify Railway IP is correct
2. Check SPF record syntax
3. Ensure `include:railway.app` is correct
4. Test with: `nslookup -type=TXT miracmail.com`

### DMARC Not Working

**Problem**: No DMARC reports received

**Solutions**:
1. Check DNS record exists
2. Verify email address in `rua=` is valid
3. Wait 24-48 hours for first reports
4. Check spam folder for reports

---

## Complete DNS Configuration Example

For domain `miracmail.com` with Railway SMTP server:

```
# SPF Record
Type: TXT
Host: @
Value: v=spf1 include:railway.app ~all

# DKIM Record
Type: TXT
Host: default._domainkey
Value: v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...

# DMARC Record
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@miracmail.com

# MX Record (for receiving)
Type: MX
Host: @
Value: your-smtp-server.up.railway.app
Priority: 10
```

---

## Environment Variables Summary

Add these to Railway/Heroku:

```bash
# DKIM Configuration
DKIM_DOMAIN=miracmail.com
DKIM_SELECTOR=default
DKIM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----"

# Your domain (for SPF)
DOMAIN=miracmail.com
```

---

## Testing Checklist

- [ ] DKIM keys generated
- [ ] Environment variables set
- [ ] SPF record added to DNS
- [ ] DKIM record added to DNS
- [ ] DMARC record added to DNS
- [ ] MX record added to DNS
- [ ] DNS records verified (nslookup)
- [ ] Test email sent
- [ ] Email headers checked (SPF/DKIM/DMARC: PASS)
- [ ] Mail-tester score checked (8+/10)

---

## Timeline

- **Day 1**: Set up DNS records
- **Day 1-2**: Wait for DNS propagation
- **Day 2**: Send test emails, verify authentication
- **Week 1-2**: Monitor with `p=none`
- **Week 3-4**: Review reports, fix issues
- **Week 4+**: Tighten policy to `p=quarantine` or `p=reject`

---

## Next Steps

1. ✅ Generate DKIM keys
2. ✅ Set environment variables
3. ✅ Configure DNS records
4. ✅ Test email authentication
5. ✅ Monitor DMARC reports
6. ✅ Build email reputation over time

Once set up, your emails will have proper authentication and work with services like TikTok! 🎉

