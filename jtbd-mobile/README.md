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
├── navigation/     # React Navigation setup
├── pages/          # Screen components
└── shared/         # Shared types and schemas
```

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

The app connects to the backend API. Update the base URL in `src/lib/queryClient.ts` if needed:

```typescript
const API_BASE_URL = 'https://your-api-url.com';
```

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
- **React Navigation**: Navigation library
- **React Query**: Server state management
- **AsyncStorage**: Local data persistence
- **Zod**: Runtime type validation

### Key Differences from Web Version

- Replaced `localStorage` with `AsyncStorage`
- Replaced Wouter with React Navigation
- Replaced Radix UI with React Native components
- Replaced Framer Motion with React Native animations
- Replaced Tailwind CSS with StyleSheet API
- Replaced Lucide React with lucide-react-native

## Performance Optimization

- Images are optimized for mobile
- Data is cached using React Query
- Navigation uses native stack navigator
- AsyncStorage operations are asynchronous

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

## License

[Your License Here]

## Support

For issues or questions, please contact [your-email@example.com]
