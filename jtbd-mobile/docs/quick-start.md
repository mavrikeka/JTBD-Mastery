# Quick Start Guide - JTBD Mastery Mobile

## ✅ Conversion Complete!

Your web app has been successfully converted to a mobile app using Expo and React Native.

## 🚀 Get Started in 3 Steps

### Step 1: Navigate to the Mobile App Directory
```bash
cd jtbd-mobile
```

### Step 2: Install Dependencies (if not done)
```bash
npm install
```

### Step 3: Start the App
```bash
npm start
```

This will open Expo Dev Tools. You can then:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan QR code with Expo Go app on your phone

## 📱 Testing on Devices

### iOS (Mac only)
```bash
npm run ios
```
Requires Xcode and iOS Simulator installed.

### Android
```bash
npm run android
```
Requires Android Studio and Android Emulator installed.

### Web (for quick testing)
```bash
npm run web
```

## 📂 Project Structure

```
jtbd-mobile/
├── src/
│   ├── components/      # UI components (Button, Card, Input, etc.)
│   ├── pages/          # Main screens (Home, Learn, Build, Critique)
│   ├── navigation/     # React Navigation setup
│   ├── data/           # Static data (examples, scenarios, quiz)
│   ├── lib/            # Utilities (storage, API, theme)
│   └── shared/         # Types and schemas
├── App.tsx             # Root component
├── app.json            # Expo configuration
└── eas.json            # Build configuration
```

## ✨ What's Included

All major features from the web app:

✅ **Home Screen** - Dashboard with 3 learning modes
✅ **Learn Mode** - 10 JTBD examples with good/bad comparisons
✅ **Build Mode** - Interactive JTBD builder with scenarios
✅ **Critique Mode** - AI-powered feedback system

## 🔧 What Needs Configuration

### 1. API Endpoint (Required)

Update the API URL in `src/lib/queryClient.ts`:

```typescript
// Replace with your backend URL
const API_BASE_URL = 'https://your-backend-url.com';
```

### 2. Features to Complete

- **Learn Mode Quiz** - Currently shows placeholder
- **Build Mode Steps** - Only "What" step is implemented
- **Critique API Integration** - Using mock data currently

See `CONVERSION-SUMMARY.md` for detailed implementation guide.

## 📦 Building for Production

### Install EAS CLI
```bash
npm install -g eas-cli
```

### Login to Expo
```bash
eas login
```

### Build for iOS
```bash
eas build --platform ios
```

### Build for Android
```bash
eas build --platform android
```

### Build for Both
```bash
eas build --platform all
```

## 🎯 Key Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm run web` | Run in web browser |
| `npx tsc --noEmit` | Check TypeScript errors |

## 📚 Documentation

- `README.md` - Full documentation
- `CONVERSION-SUMMARY.md` - Detailed conversion notes
- `eas.json` - Build configuration
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation Docs](https://reactnavigation.org/)

## 🐛 Troubleshooting

### Clear cache
```bash
npm start -- --clear
```

### Reset everything
```bash
rm -rf node_modules && npm install
npm start -- --clear
```

### Check TypeScript
```bash
npx tsc --noEmit
```

## ✅ Current Status

- ✅ TypeScript compilation: **PASSING**
- ✅ All screens created: **4/4 complete**
- ✅ Navigation: **Working**
- ✅ Components: **All base components ready**
- ✅ Data layer: **Fully migrated**
- ⏳ API integration: **Needs configuration**
- ⏳ Full features: **Some placeholders remain**

## 🎉 Next Steps

1. **Test locally** - Run `npm start` and test on simulator
2. **Configure API** - Update backend URL
3. **Implement features** - Complete quiz, build mode, critique
4. **Build preview** - Create test builds
5. **Deploy** - Submit to App Store & Play Store

## 💡 Tips

- Start with iOS simulator - it's faster to launch
- Use Expo Go app for quick testing on real devices
- Test on both iOS and Android before production build
- Keep web version in sync if maintaining both

## 🆘 Need Help?

- Check `CONVERSION-SUMMARY.md` for detailed technical info
- See `README.md` for comprehensive documentation
- Review Expo docs for platform-specific issues

---

**You're all set!** Run `npm start` to begin testing your mobile app. 🚀
