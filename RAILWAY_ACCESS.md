# Accessing Your Railway Deployment

## How to Find Your Web App URL

### Step 1: Generate a Public Domain

1. Go to your Railway dashboard: https://railway.app/dashboard
2. Click on your deployed project (`JTBD-Mastery` or whatever you named it)
3. Click on the **service/deployment** (you should see it building or deployed)
4. Go to the **"Settings"** tab
5. Scroll down to **"Networking"** section
6. Click **"Generate Domain"**
7. Railway will create a URL like: `https://jtbd-mastery-production.up.railway.app`

### Step 2: Access Your Web App

Once the domain is generated, you can access:
- **Web App**: `https://your-app-name.up.railway.app`
- **API Endpoints**: `https://your-app-name.up.railway.app/api/critique`

---

## What You'll See

Your deployment serves **both**:
1. **Web Interface** (React frontend) - at the root URL
2. **API Endpoints** - at `/api/*` paths

When you visit the URL, you should see your JTBD Mastery web interface.

---

## Update Mobile App to Use Railway

Once you have your Railway URL, update your mobile app:

1. Open `jtbd-mobile/src/lib/queryClient.ts`
2. Update line 8-10 to use your Railway URL:
   ```typescript
   export const API_BASE_URL =
     Constants.expoConfig?.extra?.apiBaseUrl ||
     'https://jtbd-mastery-production.up.railway.app';  // ✅ Already configured!
   ```

3. Rebuild your mobile app
4. Test the API calls!

---

## Verify Deployment is Working

Test your API with curl:
```bash
curl -X POST https://your-app-name.up.railway.app/api/critique \
  -H "Content-Type: application/json" \
  -d '{"jtbdStatement": "Test JTBD statement"}'
```

You should get a JSON response with critique data (not a 307 redirect like Replit!).

---

## Check Deployment Logs

If something isn't working:
1. In Railway dashboard, click on your service
2. Go to **"Deployments"** tab
3. Click on the latest deployment
4. View **"Build Logs"** and **"Deploy Logs"**
5. Look for errors like:
   - Missing environment variables
   - Build failures
   - Port configuration issues

---

## Common Issues

### Issue 1: Build Failed
**Solution**: Check that you added the `AGENT_AI_API_KEY` environment variable:
1. Settings → Variables
2. Add `AGENT_AI_API_KEY` = `your_api_key_value`
3. Redeploy

### Issue 2: Application Error / 502
**Solution**: Railway might be trying the wrong start command
1. Settings → scroll to "Deploy"
2. Set **Start Command**: `npm run start`
3. Set **Build Command**: `npm run build`
4. Redeploy

### Issue 3: No Domain Generated
**Solution**:
1. Make sure deployment succeeded (green checkmark)
2. Then go to Settings → Networking → Generate Domain
3. Wait a few seconds for DNS propagation

---

## Environment Variables Needed

Make sure these are set in Railway:
- `AGENT_AI_API_KEY` - Your Agent.ai API key
- `PORT` - Railway sets this automatically, don't override it

Railway automatically provides the PORT variable, so your app should work out of the box.

---

## Next Steps

1. ✅ Generate domain in Railway
2. ✅ Test API endpoint with curl
3. ✅ Update mobile app URL
4. ✅ Rebuild mobile app
5. ✅ Test mobile app API calls

Your deployment should now work without any Replit Shield blocking! 🎉
