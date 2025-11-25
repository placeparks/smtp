# Receiving Emails - Setup Guide

## The Problem

**You CANNOT run an SMTP server on Heroku** because:
- Heroku doesn't allow custom ports (like 2525, 25, 587)
- Heroku only supports HTTP traffic on the `PORT` environment variable
- SMTP servers need to listen on specific ports that Heroku blocks

## Solution Options

### Option 1: Use Mailgun Webhooks (Recommended)

Mailgun can receive emails and forward them to your Heroku app via webhooks.

#### Step 1: Install Mailgun Add-on
```bash
heroku addons:create mailgun:starter
```

#### Step 2: Configure Mailgun Domain
1. Go to your [Mailgun Dashboard](https://app.mailgun.com)
2. Add your domain (e.g., `miracmail.com`) or use the sandbox domain
3. Configure DNS records (MX, TXT) as instructed by Mailgun

#### Step 3: Set Up Webhook
1. In Mailgun dashboard, go to **Receiving** → **Routes**
2. Create a new route:
   - **Expression**: `match_recipient(".*@yourdomain.com")`
   - **Action**: `forward("https://your-heroku-app.herokuapp.com/api/webhooks/mailgun")`
   - **Priority**: 0

#### Step 4: Verify Webhook
- Mailgun will send test emails to your webhook
- Check your Heroku logs: `heroku logs --tail`
- Emails should appear in your inbox

---

### Option 2: Deploy SMTP Server Separately

Deploy the SMTP server (`server/smtp.js`) on a platform that supports custom ports:

#### Platforms that Support Custom Ports:
- **Railway** (railway.app) - Easy deployment
- **Render** (render.com) - Free tier available
- **DigitalOcean** - More control, requires setup
- **AWS EC2** - Full control

#### Steps for Railway:
1. Create a new project on Railway
2. Deploy only the SMTP server code
3. Set environment variables (MongoDB connection, etc.)
4. Railway will give you a public URL and port
5. Configure DNS MX records to point to Railway

---

### Option 3: Use SendGrid Inbound Parse (Alternative)

SendGrid also supports receiving emails via webhooks.

1. Install SendGrid: `heroku addons:create sendgrid:starter`
2. In SendGrid dashboard, go to **Settings** → **Inbound Parse**
3. Add a new hostname
4. Set webhook URL: `https://your-heroku-app.herokuapp.com/api/webhooks/sendgrid`
5. Configure DNS MX records

---

## For Now: Focus on Sending

If you just want to get started:
1. **Sending emails** ✅ - Already fixed! Use SendGrid or Gmail
2. **Receiving emails** - Can be added later with Mailgun webhooks

Your app can still work by:
- Users can send emails to each other
- Emails are saved in the database
- You can manually add emails to the database for testing

---

## Quick Start: Mailgun Webhook Setup

```bash
# 1. Install Mailgun
heroku addons:create mailgun:starter

# 2. Get your webhook URL
echo "https://your-app-name.herokuapp.com/api/webhooks/mailgun"

# 3. Configure in Mailgun dashboard:
# - Go to Receiving → Routes
# - Add route pointing to your webhook URL
# - Configure DNS MX records for your domain
```

---

## Testing

After setting up Mailgun webhooks:

1. Send a test email to `test@yourdomain.com`
2. Check Heroku logs: `heroku logs --tail`
3. You should see: "Email received via Mailgun webhook"
4. Check your app's inbox - the email should appear!

---

## Important Notes

- **DNS Configuration Required**: To receive emails, you need to configure MX records pointing to Mailgun/SendGrid
- **Domain Required**: You need a domain (like `miracmail.com`) to receive emails
- **Webhook Security**: Consider adding webhook signature verification for production

---

## Current Status

✅ **Sending emails**: Works with SendGrid/Gmail  
❌ **Receiving emails**: SMTP server cannot run on Heroku  
💡 **Solution**: Use Mailgun webhooks or deploy SMTP server separately

