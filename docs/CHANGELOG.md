# Changelog

All notable changes to the JTBD Mastery project.

---

## [2025-11-11] - Build 5: Performance & Button Responsiveness Fix

### Fixed
- **Button responsiveness in TestFlight builds** - Removed 2-second polling interval from HomePage that was causing state update conflicts
- **Bottom nav touch pressure sensitivity** - Hard presses now register correctly by increasing `delayLongPress` threshold
- **API URL configuration** - Removed fallback URL to enforce single source of truth in `app.json`
- **API URL trailing slash** - Fixed double-slash issue in API requests

### Changed
- **HomePage data loading** (jtbd-mobile/src/pages/HomePage.tsx)
  - Removed: `setInterval` polling every 2 seconds
  - Behavior: HomePage now loads data once on mount
  - Impact: Eliminates constant re-rendering that caused button lag in production builds (Hermes engine)
  - Trade-off: Recent Work section updates when navigating back to Home, not in real-time

- **API Base URL** (jtbd-mobile/src/lib/queryClient.ts)
  - Removed: Fallback URL `'https://jtbd-mastery-production.up.railway.app'`
  - Now: Throws clear error if `apiBaseUrl` not configured in `app.json`
  - Benefit: Fail-fast approach prevents silent failures with wrong URLs

- **Railway URL** (jtbd-mobile/app.json)
  - Before: `"https://jtbd-mastery-production-681a.up.railway.app/"`
  - After: `"https://jtbd-mastery-production-681a.up.railway.app"` (no trailing slash)
  - Benefit: Prevents double-slash in API paths

- **Bottom Navigation Touch Handling** (jtbd-mobile/src/navigation/SimpleNavigator.tsx)
  - Added: `delayLongPress={1000}` to TabButton TouchableOpacity
  - Added: `delayPressIn={0}` for immediate visual feedback
  - Added: `pointerEvents="box-none"` wrapper to prevent children from blocking touches
  - Added: `hitSlop` to extend vertical touch area without horizontal overlap
  - Fix: Hard presses no longer cancel navigation due to long-press gesture detection
  - Fix: Entire tab button area now responds to touches (left, center, and right)
  - Impact: All touch pressures and positions now register correctly

### Technical Details

**Why Polling Was Problematic:**
- Custom `SimpleNavigator` + 2-second polling caused state update conflicts
- Hermes JavaScript engine (production builds) batches state updates differently than JSC (Expo Go)
- Bottom navigation state updates competed with HomePage polling updates
- Resulted in delayed/dropped navigation events

**Why It Only Affected TestFlight:**
- Expo Go uses JavaScriptCore (JSC) engine with different state update prioritization
- Production builds use Hermes engine with stricter optimization
- Development mode has Fast Refresh that masks the issue

**Touch Pressure Sensitivity Issue:**
- iOS interprets hard presses as longer touch duration (50-100ms longer)
- TouchableOpacity has default `delayLongPress={500}`
- Hard presses crossed threshold, starting long-press gesture detection
- Long-press detection cancels `onPress` event → navigation doesn't fire
- Solution: Increase `delayLongPress={1000}` and add `delayPressIn={0}` for immediate feedback

**Touch Target Area Issue:**
- Icon and Text children were intercepting touch events
- Only center of button (where icon/text rendered) was responsive
- Touches to left/right edges weren't reaching TouchableOpacity's onPress
- Solution: Wrap children in View with `pointerEvents="box-none"` to let touches pass through
- Added `hitSlop` to prevent horizontal overlap between adjacent tabs while extending vertical area

### Future Considerations

**Navigation Architecture:**
Currently using custom `SimpleNavigator` (108 lines, lightweight). If future requirements include:
- Deep linking
- Stack navigation beyond bottom tabs
- Complex navigation state management
- Native navigation gestures

Consider migrating to **React Navigation** which provides:
- Built-in focus listeners (eliminates need for polling workarounds)
- Better performance optimizations
- Industry-standard patterns
- Navigation lifecycle hooks

**Trade-offs of migration:**
- Time investment: 6-12 hours
- Bundle size: +185KB
- Migration risk to core functionality
- Added complexity for simple use case

**Decision:** Keep SimpleNavigator for now. It works well for the current 4-screen bottom tab architecture. Only migrate if adding features that justify the complexity.

### Testing
- ✅ Verified 60-second timeouts for all Agent.ai API calls (adequate for 10-20s actual duration)
- ✅ Confirmed Railway server timeout (120s) and Railway platform timeout (300s) are sufficient
- ✅ Tested API endpoints from production URL

---

## [2025-11-08] - Mobile API Configuration Refactor

### Changed
- **Mobile app API URL configuration** moved from hardcoded value to environment-based configuration
- Updated `jtbd-mobile/src/lib/queryClient.ts` to use `expo-constants` for dynamic API URL
- API URL now configured in `jtbd-mobile/app.json` under `extra.apiBaseUrl`

### Added
- **Production deployment URL:** `https://jtbd-mastery-production.up.railway.app`
- New file: `jtbd-mobile/.env.example` - Documentation for mobile environment variables
- New file: `docs/development/deployment-guide.md` - Comprehensive deployment instructions
- New dependency: `expo-constants` package for reading app configuration

### Documentation Updates
- Updated `docs/architecture/codebase-overview.md`:
  - Section 6.4: Added mobile app configuration details
  - Section 8: Expanded configuration files section with `.env` and `app.json` details
  - Section 12: Updated environment setup instructions
  - Section 14: Expanded deployment section with Replit-specific instructions
  - Section 18: Updated important files table
- Updated `docs/INDEX.md`:
  - Added deployment guide to Development section
  - Updated document purposes table

### Migration Guide

**Before (Hardcoded):**
```typescript
// jtbd-mobile/src/lib/queryClient.ts
export const API_BASE_URL = 'http://192.168.68.111:5001';
```

**After (Environment-based):**
```typescript
// jtbd-mobile/src/lib/queryClient.ts
import Constants from "expo-constants";

export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  'https://jtbd-mastery-production.up.railway.app';
```

**Configuration:**
```json
// jtbd-mobile/app.json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "https://jtbd-mastery-production.up.railway.app"
    }
  }
}
```

### Benefits
- ✅ Single source of truth for API URL configuration
- ✅ Easy switching between local development and production
- ✅ No code changes needed to deploy
- ✅ Follows Expo best practices
- ✅ Documented deployment process

### Breaking Changes
None - backwards compatible with fallback URL

---

## [Previous] - Initial Release

### Features
- Learn Mode with 10 JTBD examples and interactive quiz
- Build Mode with 7-stage wizard and AI suggestions
- Critique Mode with AI-powered feedback
- Cross-platform support (Web + React Native)
- AI integration via Agent.ai (Claude Sonnet 4, GPT-4o)
- Progress tracking with localStorage/AsyncStorage
- Recent Work dashboard

---

Last updated: 2025-11-11
