# Mobile App Debugging Guide

## Quick Debug Checklist

When you click "Critique" on your mobile app, here's how to see what's happening:

## 1. Check Expo Developer Tools

### In Your Terminal (where you ran `npx expo start`):

Look for console.log output. The app already has logging:
- `📥 Critique request received:` - Request sent to API
- `✅ Request validated:` - Data passed validation
- `✅ Critique generated:` - Response received
- `❌ Critique error:` - Something failed

### Example of what you should see:
```
📥 Critique request received: { jtbdStatement: "Your statement..." }
✅ Request validated: { jtbdStatement: "Your statement..." }
🌐 Fetching new critique from API
✅ Critique generated: { overallStatus: "ready", ... }
💾 Critique saved to storage
```

## 2. Check Network Requests in Expo

### Metro Bundler Console:
1. Look at the terminal where Expo is running
2. Network requests will show up with errors if any
3. Look for:
   - `Request timed out` - API taking too long
   - `Network request failed` - Can't reach API
   - `Invalid Agent.ai API key` - API key issue

## 3. Add Debug Logging to Mobile App

If you're not seeing enough info, you can temporarily add more logging:

### Option A: Check the Expo Debug Menu

1. **On iOS**: Shake your device (or Cmd+D in simulator)
2. **On Android**: Shake device (or Cmd+M in simulator)
3. Select **"Open React DevTools"**
4. See console logs in browser DevTools

### Option B: Enable Remote Debugging

1. Open Expo debug menu (shake device)
2. Select **"Debug Remote JS"**
3. Opens Chrome DevTools
4. Go to **Console tab**
5. See all console.log output

## 4. Check API Endpoint Directly

Test if the Railway API is reachable from your network:

```bash
# From your computer
curl -X POST https://jtbd-mastery-production.up.railway.app/api/critique \
  -H "Content-Type: application/json" \
  -d '{"jtbdStatement": "Test"}' \
  --max-time 30
```

Should return JSON (not an error).

## 5. Check Railway Logs (Backend)

### See what the server receives:

1. Go to **Railway Dashboard**: https://railway.app/dashboard
2. Click your **JTBD-Mastery** project
3. Click on the **service**
4. Go to **"Deployments"** tab
5. Click on **active deployment**
6. View **"Deploy Logs"**

You should see:
```
📥 Critique request received: {...}
✅ Request validated: {...}
✅ Critique generated: {...}
```

Or errors like:
```
❌ Invalid Agent.ai API key
❌ Critique error: ...
```

## 6. Common Issues & Solutions

### Issue: "Request timed out"
**Cause**: AI processing takes 10-30 seconds
**Solution**: Already handled - timeout is set to 60 seconds in code
**Check**: Look for loading spinner on mobile app

### Issue: "Network request failed"
**Cause**: Can't reach Railway API
**Check**:
- Is Railway deployment running? (check dashboard)
- Is your mobile device on internet?
- Is the URL correct in `queryClient.ts`?

### Issue: "Invalid API key"
**Cause**: Railway doesn't have AGENT_AI_API_KEY variable
**Solution**:
1. Railway → Project → Variables
2. Add `AGENT_AI_API_KEY` with your key
3. Redeploy

### Issue: Nothing happens / No feedback
**Cause**: Error not displayed to user
**Check**:
1. Expo terminal for errors
2. Railway logs for backend errors
3. Enable remote debugging to see console

## 7. Verify Mobile App Configuration

Check that the mobile app is pointing to Railway:

```bash
# In your project
cat jtbd-mobile/src/lib/queryClient.ts | grep API_BASE_URL
```

Should show:
```typescript
export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  'https://jtbd-mastery-production.up.railway.app';
```

## 8. Real-Time Debugging Steps

### Right now, do this:

1. **Keep your terminal visible** where Expo is running
2. **Click "Critique"** on mobile app
3. **Watch the terminal** for console.log output
4. **Look for errors** in red text
5. **Share the terminal output** to debug further

### What you're looking for:

✅ **Success path**:
```
📥 Critique request received
✅ Request validated
🌐 Fetching new critique from API
✅ Critique generated
💾 Critique saved to storage
```

❌ **Error path**:
```
❌ Critique error: <error message>
```

Or:
```
Network request failed
Request timed out
```

## 9. Test with Simple Request

Try with a short statement first to rule out timeout:

Type in mobile app: **"Test"**

Should be fast (< 5 seconds) and you'll see if basic connectivity works.

## 10. Quick Network Test from Mobile

Add this temporary test to see if Railway is reachable:

In your mobile app critique page, you could temporarily add a test button that does:

```typescript
const testConnection = async () => {
  try {
    const response = await fetch('https://jtbd-mastery-production.up.railway.app/api/critique', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jtbdStatement: 'Test' })
    });
    console.log('✅ Response status:', response.status);
    const data = await response.json();
    console.log('✅ Response data:', data);
    alert('Connection works! Check console for details');
  } catch (error) {
    console.error('❌ Connection failed:', error);
    alert('Connection failed: ' + error.message);
  }
};
```

---

## What to Share for Debugging

If it's not working, share:
1. **Expo terminal output** (after clicking Critique)
2. **Any error messages** from mobile app
3. **Railway deployment logs** (from dashboard)
4. **Network tab** from browser DevTools (if using remote debugging)

This will help identify exactly where the issue is!
