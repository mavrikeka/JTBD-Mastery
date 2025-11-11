# Deployment Guide

This guide covers deploying the JTBD Mastery application to production.

## Current Deployment: Railway

The application is deployed on **Railway**.

---

## Deployment Architecture

```
┌──────────────────────────────────────────────┐
│         Railway (Backend + Web App)          │
│                                              │
│  ├── Express Server (Port 5001)             │
│  ├── Static Web App (built from client/)    │
│  └── API Endpoints (/api/*)                 │
└──────────────────────────────────────────────┘
                    ▲
                    │ HTTPS API Calls
                    │
┌───────────────────┴──────────────────────────┐
│         Mobile App (Expo/React Native)       │
│                                              │
│  ├── iOS App (via TestFlight/App Store)     │
│  ├── Android App (via Play Store)           │
│  └── Web Build (optional)                   │
└──────────────────────────────────────────────┘
```

---

## Backend Deployment (Railway)

### Prerequisites
- Railway account (https://railway.app)
- GitHub repository
- Agent.ai API key

### Step 1: Connect GitHub to Railway
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository: `JTBD-Mastery`
4. Railway will auto-detect the Node.js project

### Step 2: Configure Environment Variables
1. In Railway project dashboard, go to **"Variables"** tab
2. Add the following environment variables:

| Key | Value | Description |
|-----|-------|-------------|
| `AGENT_AI_API_KEY` | Your API key | Get from https://agent.ai/user/settings#credits |
| `PORT` | `5001` | Server port |
| `NODE_ENV` | `production` | Environment mode |

3. Click "Add Variable" for each

### Step 3: Configure Build & Start Commands

Railway should auto-detect these from `package.json`, but verify:

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm run start
```

**package.json** scripts (already configured):
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

### Step 4: Deploy
1. Railway will automatically deploy when you push to your main branch
2. Wait for build to complete (~2-5 minutes)
3. Railway will provide a public URL (e.g., `https://your-app.railway.app`)

### Step 5: Verify Deployment
Test these endpoints:
- **Homepage:** `https://your-app.railway.app`
- **Health check:** `https://your-app.railway.app/api/suggestions` (should return 405 Method Not Allowed for GET)

---

## Mobile App Configuration

### Update API URL

**File:** `jtbd-mobile/app.json`

**For Production:**
```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "https://your-app.railway.app"
    }
  }
}
```

**For Local Development:**
```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://192.168.x.x:5001"
    }
  }
}
```

> **Note:** Get your local IP with: `ifconfig | grep "inet "` (macOS/Linux) or `ipconfig` (Windows)

### How It Works
The mobile app reads the API URL via `expo-constants`:

```typescript
// jtbd-mobile/src/lib/queryClient.ts
import Constants from "expo-constants";

export const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;
```

---

## Mobile App Deployment

### Option 1: Expo Go (Development/Testing)
1. Ensure `app.json` has production `apiBaseUrl`
2. Run: `npx expo start`
3. Scan QR code with Expo Go app
4. App connects to Railway backend

### Option 2: TestFlight/Play Store Internal Testing

**iOS (TestFlight):**
```bash
cd jtbd-mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Submit to TestFlight
eas submit --platform ios
```

**Android (Internal Testing):**
```bash
cd jtbd-mobile

# Build for Android
eas build --platform android

# Submit to Play Store
eas submit --platform android
```

### Option 3: Standalone APK/IPA
```bash
# Build standalone Android APK
eas build --platform android --profile preview

# Build standalone iOS IPA
eas build --platform ios --profile preview
```

---

## Environment Management

### Backend (.env)

**Development (Local):**
```bash
# .env (not committed to Git)
AGENT_AI_API_KEY=your_key_here
PORT=5001
```

**Production (Railway):**
- Set in Railway Variables tab
- Railway injects these as environment variables at runtime

### Mobile (app.json)

**Development:**
```json
"extra": {
  "apiBaseUrl": "http://192.168.x.x:5001"
}
```

**Production:**
```json
"extra": {
  "apiBaseUrl": "https://your-app.railway.app"
}
```

---

## Deployment Checklist

### Before Deploying Backend:
- [ ] Environment variables set in Railway
- [ ] `.gitignore` includes `.env` (don't commit secrets!)
- [ ] Test locally: `npm run dev`
- [ ] Test build: `npm run build && npm start`

### Before Deploying Mobile:
- [ ] Update `apiBaseUrl` in `app.json` to production URL
- [ ] Test API connection in Expo Go
- [ ] Verify app.json bundle identifiers (iOS) and package name (Android)
- [ ] Update version number in app.json

### After Deployment:
- [ ] Test all three modes (Learn, Build, Critique)
- [ ] Verify AI suggestions work
- [ ] Check Recent Work dashboard
- [ ] Test on both iOS and Android (if applicable)

---

## Rollback Procedure

### Railway:
1. Go to Deployments tab in Railway dashboard
2. Click on a previous successful deployment
3. Click "Redeploy"
4. Or push a revert commit to GitHub

### Mobile:
1. Build and submit previous version
2. Or update `apiBaseUrl` back to working backend

---

## Monitoring & Troubleshooting

### Check Backend Logs (Railway):
1. Open Railway project dashboard
2. Click **"Deployments"** tab
3. Click on active deployment
4. View real-time logs

### Common Issues:

**❌ Mobile app can't connect to backend**
- Check `apiBaseUrl` in `app.json`
- Verify Railway deployment is running
- Test backend URL in browser
- Check Railway logs for errors

**❌ AI suggestions not working**
- Check `AGENT_AI_API_KEY` in Railway Variables
- Verify API key at https://agent.ai/user/settings#credits
- Check Railway logs for errors

**❌ Build failures**
- Check Railway build logs
- Verify all dependencies are in package.json
- Ensure Node.js version compatibility

**❌ CORS errors**
- Check server CORS configuration in `server/index.ts`
- Verify allowed origins include mobile app domain

---

## Alternative Deployment Options

### Backend Alternatives:
- **Vercel** - Serverless deployment
- **Render** - Container-based hosting
- **Railway** - Current choice (recommended for full-stack apps)
- **AWS EC2** - Full control, more complex
- **Heroku** - Traditional PaaS
- **Fly.io** - Global edge deployment

### Mobile Alternatives:
- **Expo EAS** - Managed build service (recommended)
- **Local Builds** - `expo build:ios/android` (legacy)
- **React Native CLI** - Full native control

---

## Security Considerations

### Production Checklist:
- [ ] Never commit `.env` files
- [ ] Use Railway Variables for API keys
- [ ] HTTPS only in production (Railway provides this)
- [ ] Rotate API keys periodically
- [ ] Monitor API usage and costs
- [ ] Implement rate limiting (future enhancement)

---

## Cost Considerations

### Railway:
- Free tier: $5 free credit per month
- Pay-as-you-go: Charged for usage beyond free tier
- Estimated cost: ~$5-20/month for moderate traffic

### Agent.ai:
- Pay-per-use API
- Monitor usage at https://agent.ai/user/settings#credits
- Set up billing alerts

### Expo EAS:
- Free tier: Limited builds per month
- Paid tier: Unlimited builds

---

## CI/CD Setup (Optional)

Railway automatically deploys on Git push. To customize:

1. Go to Railway project settings
2. Configure deployment triggers
3. Set up custom build commands if needed
4. Enable/disable automatic deployments

---

## Next Steps

1. **Set up monitoring:** Error tracking (Sentry, LogRocket)
2. **Implement analytics:** Track user behavior
3. **Database migration:** Move from localStorage to persistent DB
4. **CDN setup:** Serve static assets faster
5. **Add health check endpoint:** Monitor uptime

---

Last updated: 2025-11-11
