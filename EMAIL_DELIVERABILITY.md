# Using Custom Emails with External Services (TikTok, etc.)

## Can You Use Your Custom Emails?

**Short Answer**: Yes, but you need proper DNS configuration and email authentication.

## What You Need

### 1. ✅ Receiving Emails (For Verification)

To receive verification emails from TikTok, Instagram, etc., you need:

#### DNS MX Records
Configure your domain's MX (Mail Exchange) records to point to your Railway SMTP server:

```
Type: MX
Host: @ (or your domain)
Value: your-app.up.railway.app
Priority: 10
TTL: 3600
```

**Example for miracmail.com:**
```
MX Record: @ → your-smtp-server.up.railway.app (Priority: 10)
```

#### SMTP Server Running
- Your Railway SMTP server must be running and accessible
- Port 587 or 25 must be exposed
- Server must be publicly accessible

---

### 2. ⚠️ Email Authentication (Critical for Deliverability)

For services like TikTok to **trust** your emails and not mark them as spam, you need:

#### SPF Record (Sender Policy Framework)
Tells other servers which servers are allowed to send emails for your domain.

```
Type: TXT
Host: @
Value: v=spf1 include:railway.app ~all
```

#### DKIM Record (DomainKeys Identified Mail)
Cryptographically signs your emails to prove they're authentic.

```
Type: TXT
Host: default._domainkey
Value: (provided by your email service)
```

#### DMARC Record (Domain-based Message Authentication)
Policy for how to handle emails that fail SPF/DKIM checks.

```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@miracmail.com
```

---

## Current Limitations

### ❌ What Won't Work Out of the Box

1. **No Email Authentication**: Your current SMTP server doesn't have SPF/DKIM/DMARC configured
2. **No Reputation**: New domains have no email reputation
3. **Spam Filters**: Services might reject or mark emails as spam
4. **Verification Emails**: TikTok might not deliver verification emails to unverified domains

### ⚠️ Potential Issues

- **TikTok/Instagram might reject** emails from new/unverified domains
- **Emails might go to spam** folder
- **Some services require** verified email providers (Gmail, Outlook, etc.)
- **Email deliverability** is low without proper authentication

---

## Solutions

### Option 1: Use Professional Email Service (Recommended)

Instead of running your own SMTP server, use a professional service:

#### Services That Support Custom Domains:
- **Google Workspace** ($6/user/month) - Best deliverability
- **Microsoft 365** ($6/user/month) - Good for business
- **Zoho Mail** (Free tier available) - Good free option
- **ProtonMail** (Paid plans) - Privacy-focused

**Benefits:**
- ✅ Proper SPF/DKIM/DMARC setup
- ✅ High deliverability
- ✅ Works with TikTok, Instagram, etc.
- ✅ Professional email management

#### Setup:
1. Sign up for Google Workspace or similar
2. Verify your domain
3. Configure DNS records (they provide instructions)
4. Use their SMTP servers for sending
5. Use their IMAP/POP3 for receiving

---

### Option 2: Use Mailgun/SendGrid for Receiving

Use Mailgun's inbound email parsing:

1. **Install Mailgun**: `heroku addons:create mailgun:starter`
2. **Configure Domain**: Add `miracmail.com` in Mailgun dashboard
3. **Set Up Webhooks**: Forward emails to your Heroku app
4. **Configure DNS**: Use Mailgun's provided DNS records (includes SPF/DKIM)

**Benefits:**
- ✅ Proper email authentication
- ✅ Better deliverability than custom SMTP
- ✅ Webhook integration (already set up in your code)

---

### Option 3: Hybrid Approach

1. **Receiving**: Use Mailgun webhooks (better deliverability)
2. **Sending**: Use SendGrid (already configured)
3. **Custom Domain**: Configure DNS with Mailgun/SendGrid records

This gives you:
- ✅ Professional email handling
- ✅ Better deliverability
- ✅ Works with TikTok, Instagram, etc.

---

## For TikTok Specifically

### What TikTok Requires:

1. **Valid Email Address**: Must receive verification email
2. **Email Deliverability**: Email must not bounce
3. **Domain Reputation**: New domains might be flagged

### Recommendations:

1. **Use Google Workspace** or **Microsoft 365** for best results
2. **Or use Mailgun** with proper DNS configuration
3. **Test first** with a simple service before TikTok
4. **Build domain reputation** over time

---

## Quick Setup: Mailgun (Easiest)

### Step 1: Install Mailgun
```bash
heroku addons:create mailgun:starter
```

### Step 2: Add Domain in Mailgun
1. Go to Mailgun dashboard
2. Add `miracmail.com` as a domain
3. Mailgun provides DNS records

### Step 3: Configure DNS
Add these records to your domain:

**SPF:**
```
Type: TXT
Host: @
Value: v=spf1 include:mailgun.org ~all
```

**DKIM:**
```
Type: TXT
Host: k1._domainkey
Value: (provided by Mailgun)
```

**MX:**
```
Type: MX
Host: @
Value: mxa.mailgun.org (Priority: 10)
Value: mxb.mailgun.org (Priority: 10)
```

### Step 4: Verify Domain
- Mailgun will verify your DNS records
- Once verified, emails will work with TikTok!

---

## Testing

### Before Using with TikTok:

1. **Test Email Reception**:
   - Send test email from Gmail to `test@miracmail.com`
   - Check if it appears in your app

2. **Check Email Authentication**:
   - Use [MXToolbox](https://mxtoolbox.com/) to check SPF/DKIM
   - Use [Mail-Tester](https://www.mail-tester.com/) to test deliverability

3. **Test with Simple Service**:
   - Try signing up for a simple service first
   - If that works, try TikTok

---

## Summary

### ✅ Will Work:
- Receiving emails (with proper DNS)
- Basic email functionality
- Your app's email features

### ⚠️ Might Not Work:
- TikTok verification (without proper authentication)
- High deliverability (without SPF/DKIM/DMARC)
- Some services might reject (new domain reputation)

### 💡 Best Solution:
**Use Mailgun or Google Workspace** for professional email handling with proper authentication. This ensures:
- ✅ Works with TikTok, Instagram, etc.
- ✅ High deliverability
- ✅ Proper email authentication
- ✅ Professional email management

---

## Recommendation

For using emails with services like TikTok:

1. **Short term**: Use Mailgun (free tier available)
   - Better deliverability than custom SMTP
   - Proper authentication
   - Easy setup

2. **Long term**: Consider Google Workspace
   - Best deliverability
- Professional email management
   - Works everywhere
   - $6/month per user

Your current SMTP server setup is great for **internal use** (sending emails between users in your app), but for **external services like TikTok**, you'll want proper email authentication and reputation.

