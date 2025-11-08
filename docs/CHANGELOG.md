# Changelog

All notable changes to the JTBD Mastery project.

---

## [2025-11-08] - Mobile API Configuration Refactor

### Changed
- **Mobile app API URL configuration** moved from hardcoded value to environment-based configuration
- Updated `jtbd-mobile/src/lib/queryClient.ts` to use `expo-constants` for dynamic API URL
- API URL now configured in `jtbd-mobile/app.json` under `extra.apiBaseUrl`

### Added
- **Production deployment URL:** `https://jtbd-mastery-ceoworks.replit.app`
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
  'https://jtbd-mastery-ceoworks.replit.app';
```

**Configuration:**
```json
// jtbd-mobile/app.json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "https://jtbd-mastery-ceoworks.replit.app"
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

Last updated: 2025-11-08
