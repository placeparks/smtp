# Heroku Deployment Guide

## Prerequisites

1. Heroku account (sign up at [heroku.com](https://www.heroku.com))
2. Heroku CLI installed ([download here](https://devcenter.heroku.com/articles/heroku-cli))
3. Git installed

## Quick Deployment Steps

### 1. Login to Heroku
```bash
heroku login
```

### 2. Create Heroku App
```bash
cd server
heroku create your-app-name
```
(Replace `your-app-name` with your desired app name, or leave empty for auto-generated name)

### 3. Set Environment Variables
```bash
heroku config:set MONGO_URI=your_mongodb_connection_string
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set SMTP_PORT=2525
heroku config:set NODE_ENV=production
```

### 4. Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

(If your branch is `master` instead of `main`, use: `git push heroku master`)

### 5. Open Your App
```bash
heroku open
```

## Alternative: Deploy from GitHub

1. Push your code to GitHub
2. Go to [Heroku Dashboard](https://dashboard.heroku.com)
3. Create new app
4. Go to "Deploy" tab
5. Connect your GitHub repository
6. Enable automatic deploys (optional)
7. Click "Deploy Branch"

## Important Notes

### ⚠️ SMTP Server Limitation
**Heroku doesn't support custom ports like 2525 for SMTP servers.** Heroku only allows:
- HTTP traffic on the `PORT` environment variable (provided by Heroku)
- Outbound connections

**Solutions:**
1. **Use Heroku's built-in email services** (SendGrid, Mailgun add-ons)
2. **Run SMTP server on the same PORT** (not recommended, conflicts with HTTP)
3. **Use external SMTP service** (like Mailgun, SendGrid) instead of running your own SMTP server
4. **Deploy SMTP server separately** on a platform that supports custom ports (like Railway, Render, or DigitalOcean)

### Port Configuration
- Heroku automatically sets `PORT` environment variable
- Your app should use `process.env.PORT` (which it already does ✓)
- Don't hardcode port numbers

### Environment Variables
Set all required environment variables:
```bash
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set SMTP_PORT=2525
```

View all config vars:
```bash
heroku config
```

### Database
- Use MongoDB Atlas (free tier available)
- Make sure MongoDB Atlas allows connections from Heroku IPs
- Add `0.0.0.0/0` to MongoDB Atlas Network Access for testing

### Free Tier Limits
- **Free dyno hours:** 550 hours/month (shared across all apps)
- **Sleep after inactivity:** Free dynos sleep after 30 minutes of inactivity
- **Custom domains:** Supported
- **SSL:** Automatic HTTPS

### Upgrade to Paid
To avoid sleeping and get better performance:
```bash
heroku ps:scale web=1:standard-1x
```

## Useful Commands

### View Logs
```bash
heroku logs --tail
```

### Restart App
```bash
heroku restart
```

### Run Commands
```bash
heroku run node index.js
```

### Check App Status
```bash
heroku ps
```

### Open App
```bash
heroku open
```

## Troubleshooting

### App Crashes
Check logs:
```bash
heroku logs --tail
```

### MongoDB Connection Issues
1. Check MongoDB Atlas network access
2. Verify `MONGO_URI` is set correctly
3. Check connection string format

### Port Issues
- Heroku sets `PORT` automatically
- Don't hardcode port numbers
- Use `process.env.PORT` in your code

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL (automatic on Heroku)
3. Set up monitoring (Heroku Metrics)
4. Configure SMTP alternative (SendGrid/Mailgun add-on)

