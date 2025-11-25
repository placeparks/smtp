# Deploy SMTP Server on Railway

Railway supports custom ports, so you can deploy your SMTP server there.

## Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

## Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository

## Step 3: Configure for SMTP Server Only

### Option A: Create Separate SMTP Server File

Create a new file `smtp-server.js` in your server folder:

```javascript
require('dotenv').config();
const connectDB = require('./db');
const startSMTPServer = require('./smtp');

// Connect to MongoDB
connectDB();

// Start SMTP server
const SMTP_PORT = process.env.SMTP_PORT || 2525;
startSMTPServer();

console.log(`SMTP Server ready on port ${SMTP_PORT}`);
```

### Option B: Use Environment Variables

Set these in Railway:
- `MONGO_URI` - Your MongoDB connection string
- `SMTP_PORT` - 2525 (or let Railway assign one)
- `NODE_ENV` - production

## Step 4: Configure Railway

1. In Railway dashboard, go to your service
2. Click "Settings"
3. Under "Networking", expose the port (2525 or Railway's assigned port)
4. Railway will give you a public URL like: `your-app.up.railway.app`

## Step 5: Configure DNS

1. Get your Railway public URL and port
2. Configure MX records for your domain:
   ```
   Type: MX
   Host: @
   Value: your-app.up.railway.app
   Priority: 10
   ```

## Step 6: Update Your Main Heroku App

Your Heroku app doesn't need changes - it will continue to:
- Send emails via SendGrid/Gmail
- Receive emails via the Railway SMTP server (which saves to the same MongoDB)

## Important Notes

- Railway gives you a public URL and port
- You'll need to configure DNS MX records
- Both apps (Heroku + Railway) connect to the same MongoDB
- Railway free tier has limits, but should work for testing

## Cost

- Railway: Free tier available (limited hours/month)
- Heroku: Your existing setup
- Total: Free for development/testing

