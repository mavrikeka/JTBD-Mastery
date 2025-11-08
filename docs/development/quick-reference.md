# JTBD Mastery - Quick Reference Guide

## Quick Start

### Running the Application

**Backend:**
```bash
npm run dev
# Starts on http://0.0.0.0:5001
```

**Web Frontend:**
```bash
# Included in `npm run dev` - Vite auto-starts on http://localhost:5173
```

**Mobile App:**
```bash
cd jtbd-mobile
npm start
# i for iOS simulator, a for Android, or scan QR for physical device
```

### Environment Setup
1. Create `.env` file with: `AGENT_AI_API_KEY=your_key_here`
2. Update mobile `queryClient.ts` API_BASE_URL if on different network

---

## Project at a Glance

**What:** Educational platform teaching JTBD (Jobs-to-be-Done) statement writing
**Who:** Executives, product managers, consultants
**How:** Three modes - Learn, Build, Critique with AI feedback
**Tech:** React + Express + React Native

---

## Directory Highlights

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `/client/src/pages/` | Web modes | build-mode.tsx, critique-mode.tsx, learn-mode.tsx |
| `/server/` | Backend API | ai-service.ts (Agent.ai integration), scenarios.ts |
| `/jtbd-mobile/src/pages/` | Mobile screens | BuildPage.tsx, CritiquePage.tsx, LearnPage.tsx |
| `/shared/` | Shared types | schema.ts (Zod definitions) |
| `/client/src/data/` | Learning content | jtbd-examples.ts, build-scenarios.ts |

---

## Core Concepts

### Three JTBD Components (The Foundation)
1. **WHAT** - Specific work (not vague goals)
2. **HOW MUCH** - Measurable outcomes (before/after metrics)
3. **WHEN** - Clear deadline (3-5 year strategic view)

### Glass Slipper Test
"If you can Google it, it's NOT a JTBD" - must be bespoke/specific

---

## Three Application Modes

### Learn Mode
- 10 interactive JTBD examples (good vs bad)
- Pattern recognition quiz
- Progress tracking
- Covers 6 executive roles

### Build Mode
- 7-stage guided wizard
- AI suggestions at each step
- 6 realistic scenarios with rich context
- Statement polish & refinement

### Critique Mode
- AI-powered JTBD analysis
- Detailed feedback per component
- Overall readiness status
- Specific improvement suggestions

---

## Key Technologies

**Frontend:** React 18, Vite, Tailwind CSS, Radix UI, Framer Motion
**Mobile:** React Native 0.81, Expo 54, React Navigation
**Backend:** Express.js, TypeScript, Node.js
**AI:** Agent.ai LLM API (Claude Sonnet 4, GPT-4o)
**Storage:** localStorage (web), AsyncStorage (mobile)

---

## API Endpoints

### POST /api/suggestions
Request: `{ scenarioId, step, currentInput }`
Response: `{ suggestions: string[] }`
Model: gpt4o (~3-4 sec)

### POST /api/critique
Request: `{ jtbdStatement }`
Response: `{ overallStatus, whatStatus, howMuchStatus, whenStatus, feedback, suggestions }`
Model: claude-sonnet-4 (~10-12 sec)

### POST /api/polish-jtbd
Request: `{ rawStatement }`
Response: `{ polishedStatement }`

---

## Data Flow

```
User Input → Frontend (React/RN) → Backend API (Express) 
→ Agent.ai LLM → Response → Frontend Display
→ Save to localStorage/AsyncStorage
```

---

## Important Features

1. **Backend Scenario Lookup** - Mobile sends ID, backend enriches with full context
2. **Caching** - useRef Map prevents duplicate API calls
3. **Validation** - Zod schemas ensure type safety
4. **Offline-Ready** - All data persists locally
5. **Cross-Platform** - Web and mobile with feature parity

---

## Development Patterns

### Type Safety
- Zod for runtime validation
- TypeScript strict mode
- Shared schema definitions

### State Management
- React Query for server state
- useState for component state
- localStorage/AsyncStorage for persistence

### Styling
- Tailwind CSS (web)
- Custom theme system (mobile)

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Network request failed" on mobile | Update API_BASE_URL to local network IP in `queryClient.ts` |
| AGENT_AI_API_KEY undefined | Add `import 'dotenv/config'` to top of `server/index.ts` |
| Port 5000 in use (macOS) | Use port 5001 - macOS Control Center uses 5000 |
| API key returns 401 | Check Agent.ai account has credits; verify key format |
| Slow suggestions | Normal - gpt4o takes 3-4 sec, claude takes 10-12 sec |

---

## Files to Know

- `shared/schema.ts` - All TypeScript types (must match frontend & backend)
- `server/ai-service.ts` - AI prompt engineering and API calls
- `server/scenarios.ts` - 6 executive scenarios (source of truth)
- `client/pages/build-mode.tsx` - Web JTBD builder (35KB)
- `client/pages/critique-mode.tsx` - Web JTBD critic (19KB)
- `client/lib/storage.ts` - localStorage persistence layer

---

## Testing Notes

No automated tests - manual testing checklist:
- [ ] All 3 modes load without errors
- [ ] AI suggestions appear within 10 seconds
- [ ] Critique feedback displays correctly
- [ ] Recent work updates on home page
- [ ] Mobile app connects to backend on local network

---

## Performance Tips

1. **Suggestions are cached** - Same request won't call API twice
2. **Scenario lookup** - Backend enriches context, keeps payloads small
3. **Lazy loading** - Examples and scenarios load on demand
4. **Animations** - CSS transforms for GPU acceleration

---

## Deployment Checklist

- [ ] Get Agent.ai API key with sufficient credits
- [ ] Deploy backend to Render/Railway/AWS
- [ ] Update mobile API_BASE_URL to production domain (HTTPS)
- [ ] Build mobile apps: `expo build:ios` / `expo build:android`
- [ ] Submit to App Store / Google Play
- [ ] Verify HTTPS enabled on backend

---

## Future Enhancements

1. Database integration (Drizzle ORM configured)
2. User authentication (Passport.js ready)
3. Analytics tracking (hooks in place)
4. Learn mode progress resume
5. Offline scenario caching
6. Admin dashboard for content management

---

## Key Statistics

- **6 Scenarios** - CTO, VP Ops, Head Sales, CFO, CMO, CHRO
- **10 JTBD Examples** - Good/bad comparison pairs
- **7 Build Steps** - From scenario selection to final statement
- **3 Critique Components** - WHAT, HOW MUCH, WHEN
- **3 API Endpoints** - Suggestions, Critique, Polish
- **2 Platforms** - Web (Vite) + Mobile (Expo)
- **1 Backend** - Express.js serving both

---

## Documentation Reference

- **DEVELOPMENT_NOTES.md** - Setup, debugging, deployment
- **REFACTORING_CHECKPOINTS.md** - Planned improvements
- **design_guidelines.md** - Design system and patterns
- **COMPREHENSIVE_CODEBASE_OVERVIEW.md** - Full architecture (this repo)

---

## Support Resources

- Agent.ai API: https://docs.agent.ai/
- Expo Docs: https://docs.expo.dev/
- React Query: https://tanstack.com/query/
- Zod: https://zod.dev/

---

**Last Updated:** November 8, 2025
**Status:** Production-Ready
**Version:** 1.0.0
