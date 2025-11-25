# SMTP Setup Guide for Heroku

## Why SMTP Doesn't Work on Heroku by Default

**Heroku doesn't support custom ports** like 2525 for SMTP servers. Heroku only allows:
- HTTP traffic on the `PORT` environment variable
- Outbound connections to external services

You **must** use an external SMTP service to send emails from Heroku.

---

## Option 1: SendGrid (Recommended - Free Tier Available)

SendGrid is the easiest option and has a free tier (100 emails/day).

### Step 1: Install SendGrid Add-on
```bash
heroku addons:create sendgrid:starter
```

This automatically sets `SENDGRID_API_KEY` environment variable.

### Step 2: Verify Setup
The code will automatically detect and use SendGrid if `SENDGRID_API_KEY` is set.

### Alternative: Manual SendGrid Setup
If you prefer to set it up manually:

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API Key in SendGrid dashboard
3. Set environment variable:
```bash
heroku config:set SENDGRID_API_KEY=your-api-key-here
```

---

## Option 2: Gmail SMTP (Free)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication

### Step 2: Generate App Password
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Create a new app password for "Mail"
3. Copy the 16-character password

### Step 3: Set Environment Variables
```bash
heroku config:set GMAIL_USER=your-email@gmail.com
heroku config:set GMAIL_PASS=your-16-char-app-password
```

---

## Option 3: Mailgun (Free Tier Available)

### Step 1: Install Mailgun Add-on
```bash
heroku addons:create mailgun:starter
```

This automatically sets Mailgun environment variables.

### Step 2: Verify Setup
The code will automatically detect and use Mailgun if the variables are set.

---

## Option 4: Custom SMTP Server

If you have your own SMTP server:

```bash
heroku config:set SMTP_HOST=smtp.example.com
heroku config:set SMTP_PORT=587
heroku config:set SMTP_SECURE=false
heroku config:set SMTP_USER=your-username
heroku config:set SMTP_PASS=your-password
```

---

## Verify Your Configuration

After setting up, check your environment variables:
```bash
heroku config
```

You should see your SMTP credentials listed.

---

## Testing

1. Try sending an email from your app
2. Check Heroku logs:
```bash
heroku logs --tail
```

Look for:
- ✅ "Message sent: ..." - Success!
- ❌ "SMTP send failed" - Check your credentials

---

## Troubleshooting

### Error: "No SMTP service configured"
- Make sure you've set the environment variables correctly
- Run `heroku config` to verify

### Error: "Authentication failed"
- Double-check your credentials
- For Gmail: Make sure you're using an App Password, not your regular password
- For SendGrid: Verify your API key is correct

### Emails saved but not sent
- The email is saved to your database (good!)
- But SMTP delivery failed (check logs for details)
- Verify your SMTP credentials are correct

---

## Quick Start (SendGrid - Easiest)

```bash
# Install SendGrid addon
heroku addons:create sendgrid:starter

# Verify it's set
heroku config | grep SENDGRID

# Test by sending an email from your app
```

That's it! SendGrid will automatically configure everything.

