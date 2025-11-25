# Deploy SMTP Server Separately (NOT on Heroku)

## ⚠️ Important: Heroku Cannot Host SMTP Servers

**You CANNOT deploy an SMTP server on Heroku**, even separately. Heroku doesn't support:
- Custom ports (25, 587, 2525)
- Inbound SMTP connections
- Long-running processes that listen on non-HTTP ports

## ✅ Platforms That Support SMTP Servers

### Option 1: Railway (Recommended - Easiest)

Railway.app supports custom ports and is easy to set up.

#### Steps:

1. **Sign up**: Go to [railway.app](https://railway.app) and sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `server` folder

3. **Configure**:
   - Set root directory to `server`
   - Set start command: `node smtp-server-standalone.js`
   - Add environment variables:
     ```
     MONGO_URI=your_mongodb_connection_string
     SMTP_PORT=2525
     NODE_ENV=production
     ```

4. **Expose Port**:
   - In Railway dashboard → Settings → Networking
   - Expose port 2525
   - Railway will give you a public URL

5. **Get Your Public URL**:
   - Railway will provide: `your-app.up.railway.app:2525`
   - Or use Railway's assigned port

6. **Configure DNS** (if you have a domain):
   ```
   Type: MX
   Host: @
   Value: your-app.up.railway.app
   Priority: 10
   ```

#### Cost: Free tier available (limited hours/month)

---

### Option 2: Render

Render.com also supports custom ports.

#### Steps:

1. **Sign up**: [render.com](https://render.com)

2. **Create New Web Service**:
   - Connect your GitHub repo
   - Select the `server` folder
   - Build command: `npm install` (or `yarn install`)
   - Start command: `node smtp-server-standalone.js`

3. **Environment Variables**:
   ```
   MONGO_URI=your_mongodb_connection_string
   SMTP_PORT=2525
   NODE_ENV=production
   ```

4. **Configure Port**:
   - Render will assign a port automatically
   - Or set `SMTP_PORT` environment variable

5. **Get Public URL**:
   - Render provides: `your-app.onrender.com`

#### Cost: Free tier available

---

### Option 3: DigitalOcean Droplet

More control, but requires more setup.

#### Steps:

1. **Create Droplet**:
   - Ubuntu 22.04
   - $6/month minimum

2. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone and Deploy**:
   ```bash
   git clone your-repo
   cd server
   npm install
   ```

4. **Set Environment Variables**:
   ```bash
   export MONGO_URI=your_mongodb_connection_string
   export SMTP_PORT=25
   export NODE_ENV=production
   ```

5. **Run with PM2** (to keep it running):
   ```bash
   npm install -g pm2
   pm2 start smtp-server-standalone.js --name smtp-server
   pm2 save
   pm2 startup
   ```

6. **Configure Firewall**:
   ```bash
   sudo ufw allow 25/tcp
   sudo ufw allow 587/tcp
   ```

#### Cost: $6/month minimum

---

## Architecture

```
┌─────────────────┐         ┌──────────────────┐
│   Heroku App    │         │  Railway/Render  │
│  (Main Server)  │         │  (SMTP Server)   │
│                 │         │                  │
│  - API Routes   │         │  - Receives      │
│  - Send Emails  │         │    Emails        │
│  - Web App      │         │  - Saves to DB   │
└────────┬────────┘         └────────┬─────────┘
         │                            │
         └──────────┬─────────────────┘
                     │
              ┌──────▼──────┐
              │  MongoDB    │
              │  (Shared)   │
              └─────────────┘
```

Both services connect to the **same MongoDB database**, so:
- Heroku app sends emails and manages the API
- Railway/Render SMTP server receives emails and saves them to the same database
- Users see all emails in the same inbox

---

## Quick Start: Railway (Recommended)

1. **Install Railway CLI** (optional):
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Deploy**:
   ```bash
   cd server
   railway init
   railway up
   ```

3. **Set Environment Variables**:
   ```bash
   railway variables set MONGO_URI=your_mongodb_uri
   railway variables set SMTP_PORT=2525
   ```

4. **Get Public URL**:
   ```bash
   railway domain
   ```

That's it! Your SMTP server will be running on Railway.

---

## Testing

1. **Check Logs**:
   ```bash
   railway logs
   ```
   You should see: "SMTP Server running on 0.0.0.0:2525"

2. **Test Email Reception**:
   - Send an email to `test@yourdomain.com`
   - Check Railway logs for "Email received"
   - Check your MongoDB/Heroku app inbox

---

## Important Notes

- **Same MongoDB**: Both Heroku and Railway connect to the same database
- **DNS Required**: You need a domain to receive emails (MX records)
- **Port 25**: Some providers block port 25, use 587 or 2525 instead
- **Free Tiers**: Railway and Render have free tiers with limits

---

## Why Not Heroku?

Heroku's architecture is designed for:
- ✅ HTTP/HTTPS web applications
- ✅ REST APIs
- ✅ Background workers (via Heroku Workers)

Heroku is NOT designed for:
- ❌ SMTP servers
- ❌ Custom port listeners
- ❌ Inbound non-HTTP connections

This is a **platform limitation**, not something you can work around.

---

## Recommendation

**Use Railway** - it's the easiest option:
- Free tier available
- Easy GitHub integration
- Supports custom ports
- Automatic HTTPS/domain
- Simple deployment

Deploy your SMTP server there, keep your main app on Heroku, and both will share the same MongoDB database.

