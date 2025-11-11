# JTBD Mastery Mobile App

A mobile application built with React Native and Expo for mastering Jobs-to-be-Done statements through interactive learning.

## Features

- **Learn Mode**: Study 10 real-world examples of good vs bad JTBD statements
- **Build Mode**: Create your own JTBD statements with AI-powered suggestions
- **Critique Mode**: Get AI analysis and feedback on JTBD statements

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on iOS:
```bash
npm run ios
```

4. Run on Android:
```bash
npm run android
```

5. Run on Web:
```bash
npm run web
```

## Development

The app is structured as follows:

```
src/
├── components/      # Reusable UI components
├── data/           # Static data (examples, scenarios, quiz)
├── lib/            # Utilities (storage, API, theme)
├── navigation/     # Custom bottom tab navigation (SimpleNavigator)
├── pages/          # Screen components
└── shared/         # Shared types and schemas
```

### Navigation Architecture

The app uses a custom lightweight bottom tab navigator (`SimpleNavigator`) instead of React Navigation:
- **Why**: Simple 4-screen bottom tab architecture that works well for current needs
- **Benefits**: Minimal bundle size (~108 lines), easy to understand
- **Trade-offs**: No deep linking, stack navigation, or built-in lifecycle hooks
- **Future**: Consider migrating to React Navigation if you need advanced features (see `docs/CHANGELOG.md` [2025-11-11])

## Building for Production

### Using EAS Build (Recommended)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Configure your project:
```bash
eas build:configure
```

4. Build for iOS:
```bash
eas build --platform ios
```

5. Build for Android:
```bash
eas build --platform android
```

6. Build for both platforms:
```bash
eas build --platform all
```

### Creating a Preview Build

For testing on physical devices:

```bash
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

## Deploying to App Stores

### iOS App Store

1. Build production version:
```bash
eas build --platform ios --profile production
```

2. Submit to App Store:
```bash
eas submit --platform ios
```

### Google Play Store

1. Build production version:
```bash
eas build --platform android --profile production
```

2. Submit to Play Store:
```bash
eas submit --platform android
```

## Configuration

### API Endpoint

The app connects to the backend API. The base URL is configured in `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "https://jtbd-mastery-production-681a.up.railway.app"
    }
  }
}
```

**For local development**, change the URL to your local server:
```json
"apiBaseUrl": "http://192.168.x.x:5001"
```

**Important**:
- No trailing slash in the URL
- The app will throw an error if `apiBaseUrl` is not configured (fail-fast approach)
- Restart the Expo dev server after changing `app.json`

### App Metadata

Update app metadata in `app.json`:

- `name`: App display name
- `slug`: URL-friendly name
- `version`: App version
- `ios.bundleIdentifier`: iOS bundle ID
- `android.package`: Android package name

## Architecture

### Technology Stack

- **React Native**: Cross-platform mobile framework
- **Expo**: Development and deployment platform
- **TypeScript**: Type-safe development
- **Custom Navigation**: Lightweight bottom tab navigator (SimpleNavigator)
- **React Query**: Server state management
- **AsyncStorage**: Local data persistence
- **Zod**: Runtime type validation

### Key Differences from Web Version

- Replaced `localStorage` with `AsyncStorage`
- Replaced Wouter with custom `SimpleNavigator`
- Replaced Radix UI with React Native components
- Replaced Framer Motion with React Native animations
- Replaced Tailwind CSS with StyleSheet API
- Replaced Lucide React with lucide-react-native

## Performance Optimization

- Images are optimized for mobile
- Data is cached using React Query
- Navigation uses lightweight custom bottom tabs (no React Navigation overhead)
- AsyncStorage operations are asynchronous
- HomePage loads data once on mount (no polling) for better battery life
- Touch handling optimized with proper `pointerEvents` configuration

## Testing

Run on iOS Simulator:
```bash
npm run ios
```

Run on Android Emulator:
```bash
npm run android
```

## Troubleshooting

### Button Responsiveness Issues

If you experience button responsiveness issues in production builds (TestFlight/App Store) that don't occur in Expo Go:

**Symptoms:**
- Bottom navigation buttons don't respond to all touch positions
- Hard presses don't register
- Buttons feel laggy or unresponsive

**Cause:**
- Production builds use Hermes JavaScript engine (different from Expo Go's JSC)
- Touch event handling can be more sensitive in production
- State update conflicts can cause missed touch events

**Fixed in Build 5 (2025-11-11):**
- Removed 2-second polling that caused state update conflicts
- Added `pointerEvents="none"` to Icon and Text components
- Increased `delayLongPress` threshold for hard presses
- See `docs/CHANGELOG.md` for technical details

### Clear Cache

```bash
npm start -- --clear
```

### Reset Metro Bundler

```bash
npx react-native start --reset-cache
```

### Rebuild Node Modules

```bash
rm -rf node_modules && npm install
```

### App Config Not Loading

If you see "API_BASE_URL is not configured" error:
1. Check that `app.json` has `extra.apiBaseUrl` configured
2. Restart the Expo dev server
3. For EAS builds, ensure `app.json` changes are committed to git

## License

[Your License Here]

## Support

For issues or questions, please contact [your-email@example.com]
