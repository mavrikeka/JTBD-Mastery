# Deployment Guide

This guide covers deploying the JTBD Mastery application to production.

## Current Deployment: Replit

The application is currently deployed on **Replit** at:
- **URL:** https://jtbd-mastery-ceoworks.replit.app
- **Platform:** Replit Autoscale Deployment

---

## Deployment Architecture

```
┌──────────────────────────────────────────────┐
│         Replit (Backend + Web App)           │
│  https://jtbd-mastery-ceoworks.replit.app   │
│                                              │
│  ├── Express Server (Port 5001→80)          │
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

## Backend Deployment (Replit)

### Prerequisites
- Replit account
- GitHub repository connected to Replit
- Agent.ai API key

### Step 1: Connect GitHub to Replit
1. Go to https://replit.com
2. Click "Create" → "Import from GitHub"
3. Select your repository: `JTBD-Mastery`
4. Replit will auto-detect the project

### Step 2: Configure Environment Variables
1. In Replit, click the **"Secrets"** tab (🔒 icon in left sidebar)
2. Add the following secrets:

| Key | Value | Description |
|-----|-------|-------------|
| `AGENT_AI_API_KEY` | Your API key | Get from https://agent.ai/user/settings#credits |
| `PORT` | `5001` | Server port (mapped to 80 externally) |

3. Click "Add Secret" for each

### Step 3: Verify Configuration Files

**`.replit`** (should already exist):
```toml
modules = ["nodejs-20", "web"]
run = "npm run dev"

[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]

[[ports]]
localPort = 5001
externalPort = 80
```

**`package.json`** scripts:
```json
{
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build --outDir dist/public && esbuild server/index.ts --bundle --platform=node --outfile=dist/index.js",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

### Step 4: Deploy
1. Click **"Deploy"** button in Replit
2. Wait for build to complete (~2-5 minutes)
3. Test your deployment at: `https://your-repl-name.replit.app`

### Step 5: Verify Deployment
Test these endpoints:
- **Homepage:** https://jtbd-mastery-ceoworks.replit.app
- **Health check:** https://jtbd-mastery-ceoworks.replit.app/api/suggestions (should return 405 Method Not Allowed for GET)

---

## Mobile App Configuration

### Update API URL

**File:** `jtbd-mobile/app.json`

**For Production:**
```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "https://jtbd-mastery-ceoworks.replit.app"
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

export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  'https://jtbd-mastery-ceoworks.replit.app';
```

---

## Mobile App Deployment

### Option 1: Expo Go (Development/Testing)
1. Ensure `app.json` has production `apiBaseUrl`
2. Run: `npx expo start`
3. Scan QR code with Expo Go app
4. App connects to Replit backend

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

**Production (Replit):**
- Set in Replit Secrets (see Step 2 above)
- Replit injects these as environment variables

### Mobile (app.json)

**Development:**
```json
"extra": {
  "apiBaseUrl": "http://192.168.68.111:5001"
}
```

**Production:**
```json
"extra": {
  "apiBaseUrl": "https://jtbd-mastery-ceoworks.replit.app"
}
```

---

## Deployment Checklist

### Before Deploying Backend:
- [ ] Environment variables set in Replit Secrets
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

### Replit:
1. Go to Deployments history
2. Click "Rollback" on previous working deployment
3. Or redeploy from specific Git commit

### Mobile:
1. Build and submit previous version
2. Or update `apiBaseUrl` back to working backend

---

## Monitoring & Troubleshooting

### Check Backend Logs (Replit):
1. Open Replit project
2. Click **"Console"** tab
3. View real-time logs

### Common Issues:

**❌ Mobile app can't connect to backend**
- Check `apiBaseUrl` in `app.json`
- Verify Replit deployment is running
- Test backend URL in browser

**❌ AI suggestions not working**
- Check `AGENT_AI_API_KEY` in Replit Secrets
- Verify API key at https://agent.ai/user/settings#credits
- Check Replit logs for errors

**❌ CORS errors**
- Replit should handle CORS automatically
- Check server CORS configuration if needed

---

## Alternative Deployment Options

### Backend Alternatives:
- **Vercel** - Serverless deployment
- **Render** - Container-based hosting
- **Railway** - Similar to Replit
- **AWS EC2** - Full control, more complex
- **Heroku** - Traditional PaaS

### Mobile Alternatives:
- **Expo EAS** - Managed build service (recommended)
- **Local Builds** - `expo build:ios/android` (legacy)
- **React Native CLI** - Full native control

---

## Security Considerations

### Production Checklist:
- [ ] Never commit `.env` files
- [ ] Use Replit Secrets for API keys
- [ ] HTTPS only in production (Replit provides this)
- [ ] Rotate API keys periodically
- [ ] Monitor API usage and costs
- [ ] Implement rate limiting (future enhancement)

---

## Cost Considerations

### Replit:
- Free tier: Available for basic apps
- Paid tier: Required for always-on deployments
- Autoscale: Scales based on traffic

### Agent.ai:
- Pay-per-use API
- Monitor usage at https://agent.ai/user/settings#credits
- Set up billing alerts

### Expo EAS:
- Free tier: Limited builds per month
- Paid tier: Unlimited builds

---

## Next Steps

1. **Set up CI/CD:** Automate deployments on Git push
2. **Add monitoring:** Error tracking (Sentry, LogRocket)
3. **Implement analytics:** Track user behavior
4. **Database migration:** Move from localStorage to persistent DB
5. **CDN setup:** Serve static assets faster

---

Last updated: 2025-11-08
