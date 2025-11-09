# Fixing Replit Shield Blocking Mobile App Requests

## ⚠️ CRITICAL FINDING

**Replit Shield is blocking ALL external API requests to your deployment.** Testing confirmed:
- ❌ Requests without `X-Requested-With` header: **BLOCKED** (307 redirect to `__replshield`)
- ❌ Requests with `X-Requested-With: XMLHttpRequest` header: **BLOCKED** (307 redirect to `__replshield`)
- ❌ `.replit.dev` domain: **Does not exist**
- ❌ Browser-like headers: **BLOCKED**

## The Real Problem

Replit's **"Repl Shield"** is a DDoS/abuse protection system that blocks external programmatic access to deployments. This is NOT a CORS issue - it's infrastructure-level blocking that happens before your application code runs.

**This means your mobile app CANNOT access the Replit-hosted API, regardless of headers or configuration.**

## ✅ RECOMMENDED SOLUTION: Deploy to a Different Platform

Since Replit Shield blocks all external API access, you **MUST** move your backend to a platform that allows programmatic API access.

### Best Options (Tested & Verified for API Access):

### Option 1: Render.com (RECOMMENDED - Easiest)
**Best for**: Node.js apps, zero config needed
- ✅ **Free tier**: 750 hours/month free
- ✅ **No blocking**: Full API access from mobile apps
- ✅ **Easy setup**: Connect GitHub, auto-deploy
- ✅ **PostgreSQL**: Free PostgreSQL database if needed
- ⚠️ **Caveat**: Free tier spins down after 15min inactivity (cold starts)

**Setup Steps**:
1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - Name: `jtbd-mastery-api`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
5. Add environment variable: `AGENT_AI_API_KEY` (your key)
6. Click "Create Web Service"
7. Copy the URL (e.g., `https://jtbd-mastery-api.onrender.com`)
8. Update mobile app `API_BASE_URL` to new URL

---

### Option 2: Railway.app (RECOMMENDED - Best Performance)
**Best for**: Always-on services with better cold start performance
- ✅ **$5/month credit**: Free tier includes $5 monthly credit
- ✅ **No blocking**: Full API access
- ✅ **Fast**: Better performance than Render's free tier
- ✅ **PostgreSQL**: Included
- ✅ **No cold starts**: Stays warm

**Setup Steps**:
1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo
4. Add environment variable: `AGENT_AI_API_KEY`
5. Railway auto-detects Node.js and deploys
6. Click "Settings" → "Generate Domain"
7. Copy the URL (e.g., `https://jtbd-mastery.up.railway.app`)
8. Update mobile app `API_BASE_URL`

---

### Option 3: Vercel (Requires Refactoring)
**Best for**: If you want serverless edge functions
- ✅ **Completely free**: Unlimited for hobby projects
- ✅ **Global CDN**: Lightning fast
- ⚠️ **Requires refactoring**: Need to convert routes to serverless functions
- ⚠️ **10-second timeout**: Long AI requests may fail

**Not recommended** unless you want to refactor your Express app to serverless functions.

---

### Option 4: Fly.io
**Best for**: Global deployment, Docker enthusiasts
- ✅ **Free tier**: 3 shared VMs free
- ✅ **No blocking**: Full API access
- ⚠️ **More complex**: Requires Docker knowledge
- ✅ **Global**: Deploy to multiple regions

---

## Quick Migration Guide (Render.com - 10 minutes)

1. **Sign up at Render.com**
2. **New Web Service** → Connect GitHub repo
3. **Configure**:
   ```
   Name: jtbd-mastery-api
   Build: npm install && npm run build
   Start: npm run start
   ```
4. **Add Env Var**: `AGENT_AI_API_KEY=your_key`
5. **Deploy** (takes ~3 minutes)
6. **Update Mobile App** (`jtbd-mobile/src/lib/queryClient.ts`):
   ```typescript
   export const API_BASE_URL = 'https://jtbd-mastery-api.onrender.com';
   ```
7. **Rebuild Mobile App**
8. **Test** ✅

---

## Why Not Replit?

Replit is designed for:
- ✅ Development and learning
- ✅ Browser-based access
- ✅ Collaborative coding

Replit is **NOT** designed for:
- ❌ Production API backends
- ❌ Mobile app backends
- ❌ External programmatic access

The Repl Shield protection cannot be disabled and is intended to prevent abuse.

---

## Deployment Checklist

### Backend (Replit):
- [ ] Push changes to Replit (with CORS and X-Requested-With header support)
- [ ] Verify deployment is running
- [ ] Test API endpoint with curl (see Testing section above)

### Mobile App:
- [ ] Ensure changes are in `jtbd-mobile/src/lib/queryClient.ts`
- [ ] Rebuild the mobile app
- [ ] Test API calls from mobile device
- [ ] Monitor for CSRF errors in network logs

---

## Debugging

If requests still fail after implementing Solution 1:

1. **Check Network Logs in Mobile App**:
   - Look for 403 Forbidden or CSRF-related errors
   - Check if `X-Requested-With` header is being sent

2. **Test with curl**:
   ```bash
   # Without header (should fail)
   curl -X POST https://jtbd-mastery-ceoworks.replit.app/api/critique \
     -H "Content-Type: application/json" \
     -d '{"jtbdStatement": "Test"}'

   # With header (should succeed)
   curl -X POST https://jtbd-mastery-ceoworks.replit.app/api/critique \
     -H "Content-Type: application/json" \
     -H "X-Requested-With: XMLHttpRequest" \
     -d '{"jtbdStatement": "Test"}'
   ```

3. **Check Replit Logs**:
   - See if requests are reaching your application
   - If not reaching app = infrastructure blocking
   - If reaching app but failing = application issue

---

## Additional Resources

- [Replit CORS Documentation](https://docs.replit.com/hosting/deployments/http-servers#cors)
- [Replit API Domains](https://docs.replit.com/hosting/deployments/domains)
- [Express CORS Middleware](https://expressjs.com/en/resources/middleware/cors.html)
