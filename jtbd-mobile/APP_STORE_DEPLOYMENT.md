# Deploy JTBD Mastery Mobile App to App Stores

Complete guide to deploying your React Native/Expo app to iOS App Store and Google Play Store.

---

## Quick Workflow (For Subsequent Builds)

**Already set up EAS and deployed before?** Skip to here for quick commands.

**⚠️ IMPORTANT**: All commands must be run from the `jtbd-mobile` directory!

```bash
# Make sure you're in the correct directory
cd /Users/vikramekambaram/JTBD-Mastery/jtbd-mobile

# Update build number in app.json first
# iOS: "buildNumber": "4" (increment each build)

# Option 1: Build and auto-submit in one command (recommended)
eas build --platform ios --profile production --auto-submit

# Option 2: Build then submit separately
eas build --platform ios --profile production
eas submit --platform ios --latest

# For Android
eas build --platform android --profile production --auto-submit
```

**Common mistakes to avoid:**
- ❌ Running from wrong directory (will create new EAS project)
- ❌ Forgetting to increment build number
- ❌ Not committing changes to git before building

---

## Prerequisites

### 1. Developer Accounts

**Apple Developer Program** ($99/year)
- Sign up: https://developer.apple.com/programs/
- Required for: iOS App Store, TestFlight

**Google Play Developer** ($25 one-time)
- Sign up: https://play.google.com/console/signup
- Required for: Android Play Store

### 2. Install EAS CLI

```bash
npm install -g eas-cli
```

### 3. Prepare Assets

You need proper app icons and splash screens:
- **App Icon**: 1024x1024px PNG (no transparency)
- **Splash Screen**: 2048x2048px PNG
- Already configured in your `app.json`

---

## Step 1: Configure EAS Project

```bash
cd jtbd-mobile

# Login to Expo account
eas login

# Create Expo account if you don't have one
# https://expo.dev/signup

# Initialize EAS
eas build:configure
```

This creates `eas.json` configuration file.

---

## Step 2: Update App Configuration

### A. Get EAS Project ID

After running `eas build:configure`, it will give you a project ID. Update `app.json`:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-actual-project-id-here"
      }
    }
  }
}
```

### B. Update Bundle Identifiers (Important!)

Choose unique identifiers for your app:

**iOS** (`app.json`):
```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.yourcompany.jtbdmastery"
}
```

**Android** (`app.json`):
```json
"android": {
  "package": "com.yourcompany.jtbdmastery"
}
```

> **Note**: Use your own domain/company name. These must be unique across all apps.

---

## Step 3: Build for iOS

### Option A: Build on EAS Cloud (Recommended - Easier)

```bash
# Build for iOS App Store
eas build --platform ios --profile production

# Or build for TestFlight testing first
eas build --platform ios --profile preview
```

**What happens:**
1. EAS uploads your code to Expo's build servers
2. Builds the iOS app in the cloud
3. You'll be prompted for Apple credentials
4. Download the `.ipa` file when complete

### Option B: Build Locally (Requires Mac)

```bash
eas build --platform ios --local
```

Requires:
- macOS with Xcode installed
- Apple Developer certificates configured

---

## Step 4: Build for Android

```bash
# Build for Google Play Store
eas build --platform android --profile production

# Or build APK for testing
eas build --platform android --profile preview
```

**What happens:**
1. EAS builds Android app (`.aab` file)
2. Downloads when complete
3. Ready to upload to Play Store

---

## Step 5: Submit to App Store (iOS)

### Option 1: Submit via EAS (Easiest)

```bash
eas submit --platform ios --latest
```

Prompts you for:
- Apple ID credentials
- App Store Connect API key (optional but recommended)

### Option 2: Manual Upload

1. Download the `.ipa` file from EAS build
2. Open **Transporter** app (Mac)
3. Drag and drop `.ipa` file
4. Upload to App Store Connect

### After Upload:

1. Go to **App Store Connect**: https://appstoreconnect.apple.com
2. Create new app (if first time):
   - App name: "JTBD Mastery"
   - Primary language: English
   - Bundle ID: Your bundle identifier
   - SKU: `jtbd-mastery-001`
3. Fill in app details:
   - **Description**: Your app description
   - **Keywords**: JTBD, jobs to be done, product management
   - **Support URL**: Your website
   - **Privacy Policy URL**: Required!
   - **Screenshots**: Need iPhone screenshots (6.5" and 5.5")
   - **App Preview**: Optional video
4. Submit for review

**Review time**: Usually 1-3 days

---

## Step 6: Submit to Play Store (Android)

### Option 1: Submit via EAS

```bash
eas submit --platform android --latest
```

### Option 2: Manual Upload

1. Go to **Google Play Console**: https://play.google.com/console
2. Create new app:
   - App name: "JTBD Mastery"
   - Default language: English
   - App type: App
   - Free/Paid: Free
3. Upload the `.aab` file to "Production" track
4. Fill in store listing:
   - **Description**: App description
   - **Screenshots**: Need 2+ phone screenshots
   - **App icon**: 512x512px
   - **Feature graphic**: 1024x500px
   - **Privacy Policy**: Required!
5. Complete content rating questionnaire
6. Submit for review

**Review time**: Usually 1-3 hours to 2 days

---

## App Store Requirements

### Screenshots Needed

**iOS (Required sizes):**
- 6.5" iPhone (1284 x 2778 px): 3-10 screenshots
- 5.5" iPhone (1242 x 2208 px): 3-10 screenshots
- iPad Pro (2048 x 2732 px): Optional but recommended

**Android:**
- Phone: 1080 x 1920 px minimum (2-8 screenshots)
- 7" Tablet: Optional
- 10" Tablet: Optional

### Privacy Policy

Both stores **require** a privacy policy URL. You need to create one that covers:
- What data you collect (API usage, user inputs)
- How you use it
- Third-party services (Agent.ai API)

**Quick solution**: Use a privacy policy generator:
- https://www.privacypolicies.com/
- https://www.freeprivacypolicy.com/

Host it on your website or use a free hosting service.

---

## Testing Before Submission

### iOS: TestFlight

```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Submit to TestFlight
eas submit --platform ios --latest
```

Then:
1. Go to App Store Connect → TestFlight
2. Add internal testers (up to 100)
3. Add external testers (up to 10,000, requires quick review)
4. Share TestFlight link with testers

**Important Testing Notes:**
- **Test button responsiveness thoroughly** - Production builds (Hermes engine) behave differently than Expo Go (JSC engine)
- **Test all touch positions** - Top, bottom, left, right, center of buttons
- **Test with different touch pressures** - Soft taps and hard presses
- **Test navigation** - All bottom tab buttons should respond consistently
- See `docs/CHANGELOG.md` [2025-11-11] for fixes implemented in Build 5

### Android: Internal Testing

1. Google Play Console → Testing → Internal testing
2. Upload your `.aab` file
3. Add testers by email
4. Share testing link

---

## EAS Build Profiles

Your `eas.json` should look like this:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Profiles:**
- `development`: For local development builds
- `preview`: For TestFlight/Internal testing
- `production`: For App Store/Play Store

---

## Costs Summary

### One-Time Costs:
- **Google Play Developer**: $25 one-time
- **App icons/graphics**: Free (if you design) or $50-200 (if you hire)

### Annual Costs:
- **Apple Developer Program**: $99/year
- **EAS Build**: Free tier includes limited builds, or $29/month for unlimited

### Free Tier Limits (Expo):
- Build time: Limited
- For serious apps: Consider EAS subscription ($29/mo)

---

## Build Commands Cheat Sheet

```bash
# Build both platforms
eas build --platform all

# Build for production
eas build --platform ios --profile production
eas build --platform android --profile production

# Build for testing
eas build --platform ios --profile preview
eas build --platform android --profile preview

# Submit to stores
eas submit --platform ios --latest
eas submit --platform android --latest

# Check build status
eas build:list

# View build logs
eas build:view <build-id>
```

---

## Common Issues

### Issue: "Bundle identifier already in use"
**Solution**: Change your bundle ID in `app.json` to something unique

### Issue: "Missing provisioning profile"
**Solution**: EAS will prompt you to create one automatically

### Issue: "Build failed - Missing dependencies"
**Solution**: Make sure all dependencies are in `package.json` and committed

### Issue: "App rejected - Missing privacy policy"
**Solution**: Create and host a privacy policy, add URL to app listing

### Issue: "Screenshots don't meet requirements"
**Solution**: Use Expo's simulator or real device to capture proper sizes

---

## Post-Launch Checklist

After your app is live:

1. ✅ **Monitor reviews** - Respond to user feedback
2. ✅ **Track analytics** - See how users engage
3. ✅ **Fix bugs quickly** - Submit updates via EAS
4. ✅ **Update regularly** - New features, improvements
5. ✅ **Marketing** - Share on social media, website

---

## Update Process (After Initial Launch)

When you want to push an update:

```bash
# 1. Update version in app.json
# Change "version": "1.0.0" to "1.0.1" or "1.1.0"

# 2. Build new version
eas build --platform all --profile production

# 3. Submit update
eas submit --platform ios --latest
eas submit --platform android --latest
```

Updates are reviewed again but usually faster (1-2 days for iOS, few hours for Android).

---

## Resources

- **Expo Docs**: https://docs.expo.dev/
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **EAS Submit**: https://docs.expo.dev/submit/introduction/
- **App Store Connect**: https://appstoreconnect.apple.com
- **Google Play Console**: https://play.google.com/console
- **TestFlight**: https://developer.apple.com/testflight/

---

## Next Steps

1. ✅ Sign up for developer accounts (Apple + Google)
2. ✅ Install EAS CLI: `npm install -g eas-cli`
3. ✅ Run `eas build:configure` in `jtbd-mobile/`
4. ✅ Create app icons and screenshots
5. ✅ Create privacy policy
6. ✅ Build and test with TestFlight/Internal Testing
7. ✅ Submit to App Store and Play Store
8. ✅ Celebrate launch! 🎉

Good luck with your app launch!
