# Deploy SMTP Server on Railway - Step by Step

## Prerequisites
- GitHub account
- Your code pushed to GitHub
- MongoDB connection string (same one used in Heroku)

---

## Step 1: Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (easiest option)
4. Authorize Railway to access your GitHub

---

## Step 2: Create New Project

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository (`email-generator`)
4. Railway will start deploying (this will fail initially - that's OK!)

---

## Step 3: Configure the Service

1. Click on the service that was created
2. Go to **"Settings"** tab
3. Scroll down to **"Root Directory"**
4. Set it to: `server`
5. Scroll to **"Start Command"**
6. Set it to: `node smtp-server-standalone.js`

---

## Step 4: Set Environment Variables

1. Still in **"Settings"** tab
2. Scroll to **"Variables"** section
3. Click **"New Variable"** and add:

   **Variable 1:**
   - Name: `MONGO_URI`
   - Value: `your_mongodb_connection_string` (same as Heroku)
   - Click **"Add"**

   **Variable 2:**
   - Name: `SMTP_PORT`
   - Value: `587`
   - Click **"Add"**

   **Variable 3:**
   - Name: `NODE_ENV`
   - Value: `production`
   - Click **"Add"**

---

## Step 5: Expose the Port

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"** (Railway will create a public URL)
3. Or manually expose port 587:
   - Click **"Expose Port"**
   - Port: `587`
   - Protocol: `TCP`

---

## Step 6: Deploy

1. Go back to **"Deployments"** tab
2. Click **"Redeploy"** (or Railway will auto-deploy)
3. Wait for deployment to complete (1-2 minutes)
4. Check the **"Logs"** tab

---

## Step 7: Verify It's Working

1. Click on **"Logs"** tab
2. You should see:
   ```
   MongoDB connected for SMTP server
   Starting SMTP server on port 587...
   SMTP Server running on 0.0.0.0:587
   ✅ SMTP Server is running and ready to receive emails
   ```

If you see errors, check:
- MongoDB connection string is correct
- All environment variables are set
- Port is exposed

---

## Step 8: Get Your Public URL

1. Go to **"Settings"** → **"Networking"**
2. You'll see your public URL, something like:
   - `your-app.up.railway.app:587`
   - Or Railway might assign a different port

**Save this URL** - you'll need it for DNS configuration!

---

## Step 9: Configure DNS (If You Have a Domain)

If you want to receive emails at `user@miracmail.com`:

1. Go to your domain registrar (where you bought the domain)
2. Add an **MX Record**:
   ```
   Type: MX
   Host: @ (or your domain)
   Value: your-app.up.railway.app
   Priority: 10
   TTL: 3600
   ```

3. Wait for DNS propagation (can take up to 24 hours, usually 1-2 hours)

---

## Step 10: Test

1. Send a test email to `test@yourdomain.com` (if DNS is configured)
2. Or test locally using a mail client pointing to Railway's URL
3. Check Railway logs - you should see:
   ```
   Email received from: sender@example.com
   Subject: Test Email
   Email saved to MongoDB
   ```
4. Check your Heroku app's inbox - the email should appear!

---

## Troubleshooting

### Error: "MongoDB connection failed"
- Check your `MONGO_URI` is correct
- Make sure MongoDB allows connections from Railway's IPs
- Check MongoDB Atlas network access settings

### Error: "Port already in use"
- Railway might be using a different port
- Check Railway's assigned port in the Networking section
- Update `SMTP_PORT` environment variable to match

### No emails received
- Check DNS MX records are configured correctly
- Verify Railway URL is correct
- Check Railway logs for errors
- Make sure port is exposed in Railway settings

### Service keeps restarting
- Check logs for errors
- Verify all environment variables are set
- Make sure `smtp-server-standalone.js` file exists

---

## Quick Commands (If Using Railway CLI)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
cd server
railway link

# Set environment variables
railway variables set MONGO_URI=your_mongodb_uri
railway variables set SMTP_PORT=587
railway variables set NODE_ENV=production

# Deploy
railway up

# View logs
railway logs

# Get public URL
railway domain
```

---

## Architecture After Deployment

```
┌─────────────────────┐
│   Heroku (Main)     │
│  - API Routes       │
│  - Send Emails      │
│  - Web App          │
└──────────┬──────────┘
           │
           │ (Same MongoDB)
           │
┌──────────▼──────────┐
│  Railway (SMTP)     │
│  - Receive Emails   │
│  - Port 587         │
└─────────────────────┘
```

Both services share the **same MongoDB database**, so emails received on Railway will appear in your Heroku app's inbox!

---

## Cost

- **Railway Free Tier**: 
  - $5 credit/month
  - ~500 hours of runtime
  - Perfect for development/testing

- **Paid Plans**: Start at $5/month if you exceed free tier

---

## Next Steps

1. ✅ SMTP server deployed on Railway
2. ✅ Main app on Heroku
3. ✅ Both connected to same MongoDB
4. ⏭️ Configure DNS MX records (if you have a domain)
5. ⏭️ Test sending/receiving emails

You're all set! 🎉

