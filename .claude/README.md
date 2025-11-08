# JTBD-Mastery - Claude Code Navigation Guide

## Quick Project Overview
Educational platform for learning Jobs-to-be-Done (JTBD) statement writing with AI assistance.

**Stack:** React (Web) + React Native (Mobile) + Express (Backend) + Agent.ai LLM

---

## Directory Structure & Key Files

### Web Application (`client/`)
```
client/src/
├── pages/
│   ├── learn-mode.tsx          # 10 interactive JTBD examples + quiz
│   ├── build-mode.tsx          # 7-stage wizard with AI suggestions
│   ├── critique-mode.tsx       # AI-powered JTBD analysis
│   └── recent-work.tsx         # Dashboard with progress tracking
├── components/
│   ├── ui/                     # Radix UI components (shadcn-based)
│   ├── learn/                  # Learn mode components
│   ├── build/                  # Build mode wizard stages
│   └── critique/               # Critique mode components
├── lib/
│   ├── api.ts                  # API client functions
│   ├── storage.ts              # localStorage wrapper
│   └── utils.ts                # Utilities
├── types/
│   └── index.ts                # TypeScript types & Zod schemas
└── App.tsx                     # Main router (React Router)
```

### Mobile Application (`jtbd-mobile/`)
```
jtbd-mobile/
├── src/
│   ├── screens/
│   │   ├── LearnModeScreen.tsx
│   │   ├── BuildModeScreen.tsx
│   │   ├── CritiqueModeScreen.tsx
│   │   └── RecentWorkScreen.tsx
│   ├── components/
│   │   ├── learn/
│   │   ├── build/
│   │   └── critique/
│   ├── navigation/
│   │   └── AppNavigator.tsx    # React Navigation setup
│   ├── services/
│   │   ├── api.ts              # API client
│   │   └── storage.ts          # AsyncStorage wrapper
│   └── types/
│       └── index.ts            # Shared types with web
├── App.tsx                     # Entry point
└── app.json                    # Expo configuration
```

### Backend (`server/`)
```
server/
├── ai-service.ts               # AI integration (Agent.ai)
├── index.ts                    # Express server setup
├── routes/
│   └── api.ts                  # API endpoints
└── data/
    └── scenarios.ts            # 6 executive role scenarios
```

---

## Core Concepts

### JTBD Statement Structure
All modes work with this 7-component structure:
1. **Actor** - Who is performing the job
2. **Motivation** - Why they want to do it
3. **Job** - The core functional task
4. **Outcome** - Desired end result
5. **Contextual** - Situational context
6. **Emotional** - Emotional drivers
7. **Social** - Social/tribal factors

### Three Application Modes

#### 1. Learn Mode
- **Entry:** `client/src/pages/learn-mode.tsx` (web), `jtbd-mobile/src/screens/LearnModeScreen.tsx` (mobile)
- **Data:** Hardcoded 10 examples in component
- **Flow:** Examples → Pattern Recognition Quiz → Results
- **State:** localStorage/AsyncStorage for progress

#### 2. Build Mode
- **Entry:** `client/src/pages/build-mode.tsx` (web), `jtbd-mobile/src/screens/BuildModeScreen.tsx` (mobile)
- **Stages:** 7 progressive steps (actor → social)
- **AI:** Suggests components via `/api/ai/suggest` endpoint
- **Features:** Draft saving, reset, export, AI assistance toggle
- **Backend:** `server/ai-service.ts` - `generateSuggestions()`

#### 3. Critique Mode
- **Entry:** `client/src/pages/critique-mode.tsx` (web), `jtbd-mobile/src/screens/CritiqueModeScreen.tsx` (mobile)
- **Input:** Complete JTBD statement OR scenario selection
- **AI Analysis:**
  - Overall assessment with score
  - Component-by-component critique (7 components)
  - Suggestions for improvement
- **Backend:** `server/ai-service.ts` - `critiqueBuildMode()` and `critiqueJTBDStatement()`
- **Scenarios:** 6 executive roles in `server/data/scenarios.ts`

---

## Data Flow Patterns

### AI Suggestion Request (Build Mode)
```
User input → Build Mode UI → POST /api/ai/suggest
  ↓
  {
    currentStage: "actor" | "motivation" | ...,
    context: { previous inputs },
    existingDraft?: string
  }
  ↓
server/ai-service.ts → generateSuggestions()
  ↓
Agent.ai LLM (Claude Sonnet 4 / GPT-4o)
  ↓
Response: { suggestions: string[] }
```

### AI Critique Request (Critique Mode)
```
Option A: Scenario-based
  User selects scenario → GET /api/scenario/:id
  → Returns full context → POST /api/ai/critique
  → critiqueBuildMode() with scenario context

Option B: Free-form
  User pastes JTBD → POST /api/ai/critique
  → critiqueJTBDStatement() analyzes raw text
```

### Scenario Lookup Pattern
```
Client sends minimal payload (scenarioId)
  ↓
Server: scenarios.ts lookup
  ↓
Rich context added server-side
  ↓
Prevents payload bloat, centralized scenario data
```

---

## Key Technical Patterns

### Request Deduplication
- **File:** `server/ai-service.ts:15-30`
- **Pattern:** In-memory cache with request keys
- **Purpose:** Prevent duplicate AI calls (expensive)
- **Implementation:** `pendingRequests` Map with Promise sharing

### Type Safety
- **Schemas:** `client/src/types/index.ts` and `jtbd-mobile/src/types/index.ts`
- **Validation:** Zod schemas for API requests/responses
- **Shared Types:** Keep web/mobile types in sync

### State Management
- **Web:** React hooks + localStorage (no Redux/Zustand)
- **Mobile:** React hooks + AsyncStorage
- **Pattern:** Component-level state, persist to storage on change

### UI Components
- **Web:** Radix UI primitives + Tailwind CSS
- **Mobile:** React Native Paper + custom components
- **Shared:** Color scheme and design tokens

---

## Common Tasks & File Locations

### Modify AI Prompts
- **File:** `server/ai-service.ts`
- **Functions:**
  - `generateSuggestions()` - Build mode AI prompts
  - `critiqueBuildMode()` - Scenario critique prompts
  - `critiqueJTBDStatement()` - Free-form critique prompts

### Add/Edit Scenarios
- **File:** `server/data/scenarios.ts`
- **Structure:** Array of 6 executive role objects
- **Fields:** id, role, company, challenge, jtbdStatement, components

### Update JTBD Component Labels
- **Web:** `client/src/pages/build-mode.tsx` (stage definitions)
- **Mobile:** `jtbd-mobile/src/screens/BuildModeScreen.tsx`
- **Server:** `server/ai-service.ts` (AI understands these labels)

### Change UI Styling
- **Web Config:** `client/tailwind.config.js`
- **Web Components:** `client/src/components/ui/*`
- **Mobile Theme:** `jtbd-mobile/src/theme.ts` (if exists) or inline styles

### API Endpoints
- **File:** `server/index.ts` or `server/routes/api.ts`
- **Current:**
  - `POST /api/ai/suggest` - Build mode suggestions
  - `POST /api/ai/critique` - Critique analysis
  - `GET /api/scenario/:id` - Scenario lookup

### Environment Configuration
- **Web:** `client/.env` - API URL
- **Mobile:** `jtbd-mobile/.env` - API URL
- **Server:** `server/.env` - Agent.ai API key, port

---

## Testing & Development

### Run Development Servers
```bash
# Web app
cd client && npm run dev          # Vite dev server (port 5173)

# Mobile app
cd jtbd-mobile && npx expo start  # Expo dev server

# Backend
cd server && npm run dev          # Express server (port 3001)
```

### Build for Production
```bash
# Web
cd client && npm run build        # Output: client/dist/

# Mobile
cd jtbd-mobile && eas build       # Expo Application Services

# Server
cd server && npm run build        # Output: server/dist/
```

---

## Dependencies

### Web (`client/package.json`)
- **Framework:** React 18, Vite
- **UI:** Radix UI, Tailwind CSS, Framer Motion
- **Routing:** React Router v6
- **Utils:** date-fns, clsx, tailwind-merge

### Mobile (`jtbd-mobile/package.json`)
- **Framework:** React Native 0.81, Expo 54
- **Navigation:** React Navigation v6
- **UI:** React Native Paper, Expo Vector Icons
- **Storage:** @react-native-async-storage/async-storage

### Server (`server/package.json`)
- **Framework:** Express, TypeScript
- **AI:** @agent.ai/sdk (or similar)
- **Utils:** cors, dotenv, body-parser

---

## Architecture Decisions

### Why No Global State Management?
- Small app scope, component state sufficient
- localStorage/AsyncStorage for persistence
- Consider Redux/Zustand if complexity grows

### Why Scenario Lookup Backend Pattern?
- Keeps client payloads small
- Centralized scenario data management
- Easier to update scenarios without client changes

### Why Agent.ai Over Direct OpenAI?
- Multi-model support (Claude + GPT)
- Simpler API for educational context
- Cost optimization features

---

## Git Workflow

### Current Status
```
Branch: main
Modified files:
  - REFACTORING_CHECKPOINTS.md
  - client/src/pages/critique-mode.tsx
  - server/ai-service.ts
```

### Common Branches
- `main` - Production-ready code
- Feature branches as needed

---

## Quick File Reference

| Task | File Path |
|------|-----------|
| Add AI prompt | `server/ai-service.ts` |
| Edit learn examples | `client/src/pages/learn-mode.tsx` |
| Modify build wizard | `client/src/pages/build-mode.tsx` |
| Update critique UI | `client/src/pages/critique-mode.tsx` |
| Add scenarios | `server/data/scenarios.ts` |
| API endpoints | `server/index.ts` |
| Type definitions | `client/src/types/index.ts` |
| Web UI components | `client/src/components/ui/*` |
| Mobile screens | `jtbd-mobile/src/screens/*` |
| API client (web) | `client/src/lib/api.ts` |
| API client (mobile) | `jtbd-mobile/src/services/api.ts` |

---

## Performance Considerations

- **AI Calls:** Cached via `pendingRequests` Map in `server/ai-service.ts:15-30`
- **Bundle Size:** Web uses Vite code splitting, mobile uses Expo optimization
- **Storage:** localStorage/AsyncStorage limits (~5-10MB), sufficient for drafts
- **Animations:** Framer Motion (web) can impact performance on low-end devices

---

## Future Enhancements (Potential)

Based on codebase structure:
- User authentication (no auth currently)
- Backend database (currently in-memory scenarios)
- Collaborative editing
- JTBD library/gallery
- Export to PDF/Docs
- A/B testing different AI models
- Analytics integration

---

## Documentation Structure

All documentation has been organized into logical directories:

```
JTBD-Mastery/
├── README.md                                    # Main user-facing README
├── .claude/README.md                           # This file (Claude Code guide)
├── docs/
│   ├── architecture/
│   │   └── codebase-overview.md               # Comprehensive technical docs
│   ├── development/
│   │   ├── quick-reference.md                 # Developer quick start
│   │   ├── design-guidelines.md               # UI/UX principles
│   │   └── refactoring-notes.md               # Refactoring history
│   └── proposals/
│       ├── mobile-design.md                   # Mobile design proposal
│       └── development-notes.md               # Historical dev notes
└── jtbd-mobile/docs/
    ├── quick-start.md                          # Mobile setup guide
    ├── conversion-summary.md                   # Web→Mobile conversion log
    ├── fixes-applied.md                        # Bug fixes history
    └── final-status.md                         # Migration completion status
```

### Quick Doc Links
- **Architecture deep-dive:** `docs/architecture/codebase-overview.md`
- **Developer onboarding:** `docs/development/quick-reference.md`
- **Mobile setup:** `jtbd-mobile/docs/quick-start.md`
- **Design system:** `docs/development/design-guidelines.md`

---

*This guide optimizes Claude Code navigation. For comprehensive documentation, see docs/ directory.*
