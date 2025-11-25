# Railway Quick Start - 5 Minutes

## 🚀 Fastest Way to Deploy

### 1. Go to Railway
👉 [railway.app](https://railway.app) → Sign up with GitHub

### 2. Create Project
- Click **"New Project"**
- Select **"Deploy from GitHub repo"**
- Choose your `email-generator` repo

### 3. Configure Service
Click on the service → **Settings**:

**Root Directory:** `server`  
**Start Command:** `node smtp-server-standalone.js`

### 4. Add Variables
In **Settings** → **Variables**, add:

```
MONGO_URI = (same as your Heroku app)
SMTP_PORT = 587
NODE_ENV = production
```

### 5. Expose Port
**Settings** → **Networking** → **Generate Domain**

### 6. Done! ✅
Check **Logs** tab - you should see:
```
✅ SMTP Server is running and ready to receive emails
```

---

## 📋 What You Need

- ✅ GitHub repo pushed
- ✅ MongoDB connection string (from Heroku)
- ✅ 5 minutes

---

## 🎯 That's It!

Your SMTP server is now running on Railway and will receive emails!

See `RAILWAY_DEPLOY_STEPS.md` for detailed instructions.

