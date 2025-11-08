# JTBD Mastery - Comprehensive Codebase Overview

## Project Summary

JTBD Mastery is a comprehensive educational platform for learning and mastering Jobs-to-be-Done (JTBD) statement writing. It provides an interactive, multi-platform learning experience with three core modes: Learn, Build, and Critique. The application leverages AI (Agent.ai) to provide intelligent suggestions and feedback.

**Target Users:** Executives, product managers, strategy consultants, and business leaders who need to write precise JTBD statements for strategic initiatives.

**Key Concept:** The "Glass Slipper Test" - A JTBD statement must be so bespoke and specific that if you Google it, it doesn't match. It should exclude 95% of candidates.

---

## 1. Project Structure

```
JTBD-Mastery/
├── client/                      # Web application (React + Vite)
│   ├── src/
│   │   ├── pages/              # Main application pages/modes
│   │   ├── components/         # Reusable UI components
│   │   ├── data/               # Static learning content
│   │   ├── lib/                # Utilities and storage
│   │   ├── hooks/              # React hooks
│   │   └── index.css           # Global styles
│   ├── public/
│   ├── index.html
│   └── package.json
│
├── server/                      # Express.js backend
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # API route definitions
│   ├── ai-service.ts          # Agent.ai integration
│   ├── scenarios.ts           # Scenario data and helpers
│   ├── storage.ts             # Data persistence
│   └── vite.ts               # Vite configuration helpers
│
├── jtbd-mobile/               # React Native mobile app (Expo)
│   ├── src/
│   │   ├── pages/            # Mobile screens
│   │   ├── components/       # Native components
│   │   ├── navigation/       # Navigation system
│   │   ├── data/             # Static content
│   │   ├── lib/              # Utilities and theme
│   │   └── shared/           # Shared schema
│   ├── app.json             # Expo configuration
│   ├── App.tsx              # Root component
│   └── package.json
│
├── shared/                    # Shared TypeScript schemas
│   └── schema.ts            # Zod schemas for type validation
│
├── public/                   # Static assets
├── attached_assets/          # Brand assets
│
├── package.json             # Root project dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── drizzle.config.ts        # Database configuration (potential)
│
└── Documentation files:
    ├── DEVELOPMENT_NOTES.md
    ├── REFACTORING_CHECKPOINTS.md
    ├── design_guidelines.md
    ├── README.md (in mobile app)
    └── .env.example
```

---

## 2. Main Applications/Modules

### 2.1 Web Application (Client)
- **Location:** `/Users/vikramekambaram/JTBD-Mastery/client/`
- **Framework:** React 18.3.1 with Vite
- **Routing:** Wouter (lightweight routing)
- **Key Features:**
  - Learn Mode - Interactive JTBD examples gallery
  - Build Mode - Step-by-step JTBD statement creation
  - Critique Mode - AI-powered JTBD analysis
  - Recent Work Dashboard

### 2.2 Backend Server
- **Location:** `/Users/vikramekambaram/JTBD-Mastery/server/`
- **Framework:** Express.js 4.21.2
- **Port:** 5001 (5000 reserved by macOS Control Center)
- **Key Responsibilities:**
  - API endpoints for suggestions and critiques
  - Integration with Agent.ai LLM API
  - Scenario context management
  - Session management

### 2.3 Mobile App (React Native)
- **Location:** `/Users/vikramekambaram/JTBD-Mastery/jtbd-mobile/`
- **Framework:** React Native 0.81.5 with Expo 54.0.20
- **Target Platforms:** iOS, Android, Web
- **Features:** Mirrored functionality from web app with native optimizations

### 2.4 Shared Code
- **Location:** `/Users/vikramekambaram/JTBD-Mastery/shared/`
- **Contents:** TypeScript/Zod schemas used across client and server
- **Ensures:** Type safety between frontend and backend

---

## 3. Technology Stack

### Frontend (Web)
- **React** 18.3.1 - UI framework
- **TypeScript** 5.6.3 - Type safety
- **Vite** 5.4.20 - Build tool and dev server
- **Wouter** 3.3.5 - Lightweight client-side routing
- **TanStack React Query** 5.60.5 - Data fetching and caching
- **Framer Motion** 11.13.1 - Animations
- **Tailwind CSS** 3.4.17 - Utility-first styling
- **Radix UI** - Headless component library (extensive suite)
- **Lucide Icons** 0.453.0 - SVG icons
- **React Hook Form** 7.55.0 - Form management
- **Zod** 3.24.2 - Schema validation

### Frontend (Mobile)
- **React Native** 0.81.5 - Cross-platform mobile
- **Expo** 54.0.20 - Managed React Native framework
- **React Navigation** 6.1.18 - Mobile navigation
- **React Native Paper** 5.14.5 - Material Design components
- **AsyncStorage** 2.2.0 - Mobile persistent storage
- **TanStack React Query** 5.90.5 - Data management
- **Zod** 3.25.76 - Schema validation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** 4.21.2 - Web framework
- **TypeScript** 5.6.3 - Type safety
- **tsx** 4.20.5 - TypeScript execution
- **dotenv** - Environment variable management
- **Drizzle ORM** 0.39.1 - Database ORM (configured but not actively used)
- **Zod** 3.24.2 - Schema validation

### AI/External Services
- **Agent.ai** - LLM API (https://api-lr.agent.ai/v1/action/invoke_llm)
  - Models: `claude-sonnet-4`, `gpt4o`, `gpt-4o-mini`

### Database/Storage
- **Web:** localStorage (browser persistent storage)
- **Mobile:** AsyncStorage (React Native persistent storage)
- **Server:** Potential Neon Database via Drizzle (configured but not actively used)

### Development/Build Tools
- **eslint**, **prettier** - Code quality
- **postcss**, **autoprefixer** - CSS processing
- **esbuild** - JavaScript bundler
- **drizzle-kit** - Database schema management

---

## 4. Application Purpose & Core Concept

### What is JTBD (Jobs-to-be-Done)?

A JTBD statement articulates the specific work a customer/executive needs to accomplish. It consists of three mandatory components:

1. **WHAT** - The specific work to be done (action verbs, not vague goals)
2. **HOW MUCH** - Measurable outcomes with before/after metrics
3. **WHEN** - Clear deadline or timeframe (typically 3-5 year strategic view)

### Example Good JTBD:
"Implement lean manufacturing principles and Six Sigma quality control systems across all production lines, reducing defect rate from 4.5% to 1.2% and eliminating $2.1M in annual losses by December 2026"

### Example Bad JTBD:
"Improve quality and reduce defects next year" (missing metrics and vague timeline)

### The Glass Slipper Test:
"If you can Google it, it's NOT a JTBD." - JTBDs must be so bespoke and specific that they exclude 95% of candidates.

### Application Goals:
1. **Learn Mode** - Train users to recognize excellent vs terrible JTBDs through examples and pattern recognition
2. **Build Mode** - Guide users through creating their own JTBD statements with AI suggestions
3. **Critique Mode** - Provide AI-powered feedback on user-written statements

---

## 5. Key Features & Functionality

### 5.1 Learn Mode
- **10 Real JTBD Examples** covering different executive roles:
  - VP Operations (Manufacturing)
  - Chief Technology Officer (Cloud Migration)
  - Head of Sales (Enterprise Growth)
  - Chief Financial Officer (Cost Optimization)
  - Chief Marketing Officer (Brand Repositioning)
  - Chief People Officer (Talent Management)

- **Interactive Learning:**
  - Swipeable example cards (left = bad, right = good)
  - Detailed analysis with component breakdown
  - Pattern recognition quiz with feedback
  - Progress tracking

- **Features:**
  - Example gallery with comparison view (bad vs good)
  - Tap-to-reveal analysis overlays
  - Pattern recognition quiz (multiple question types)
  - Score tracking

### 5.2 Build Mode
- **7-Stage Wizard Flow:**
  1. Intro - Welcome and explanation
  2. Scenario Selection - Choose a role/context
  3. Context Review - Understand the situation
  4. WHAT Step - Define the specific work
  5. Metrics Step - Add measurable outcomes (HOW MUCH)
  6. WHEN Step - Set deadline/timeframe
  7. Review - Assembled final statement

- **AI Integration:**
  - Context-aware suggestions at each step
  - Backend scenario lookup for rich AI context
  - Preset hints as fallback
  - Polish endpoint to refine raw statement into cohesive sentence

- **Features:**
  - Scenario context with company details, situation bullets
  - Real-time field validation
  - AI suggestion cards (3 options)
  - Live JTBD preview
  - Copy/save functionality
  - Progress saved locally

### 5.3 Critique Mode
- **Input & Analysis:**
  - Large text area for JTBD statement input
  - AI-powered critique using Claude Sonnet 4

- **Detailed Feedback:**
  - Overall status: not-ready / needs-work / ready / exemplary
  - Component breakdown:
    - WHAT status and feedback with suggestions
    - HOW MUCH status and feedback with suggestions
    - WHEN status and feedback with suggestions
  - Improved version suggestion
  - Specific, actionable improvement recommendations

- **Features:**
  - Expandable feedback sections
  - Component status badges with icons
  - Caching for duplicate analyses
  - History of analyzed statements
  - Edit and re-analyze capability

### 5.4 Dashboard/Recent Work
- **Progress Tracking:**
  - Learn Mode completion status
  - Build Mode JTBDs created and best score
  - Critique Mode JTBDs analyzed

- **Recent Work Display:**
  - Last 3 built JTBDs
  - Last 3 critiques
  - Last 3 quiz results
  - Real-time updates (refreshes every 2 seconds)

---

## 6. Architecture & Component Interaction

### 6.1 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACES                          │
├─────────────────────────────────────────────────────────────┤
│   Web (React/Vite)    │    Mobile (React Native/Expo)      │
│   ├── Learn Mode      │    ├── Learn Page                  │
│   ├── Build Mode      │    ├── Build Page                  │
│   ├── Critique Mode   │    ├── Critique Page               │
│   └── Home Dashboard  │    └── Home Page                    │
└──────────┬────────────────────────────────┬─────────────────┘
           │                                │
           │        HTTP/JSON API           │
           │   (Port 5001, Local Network)   │
           └──────────────┬──────────────────┘
                          │
                ┌─────────▼────────┐
                │   Express.js     │
                │   Backend        │
                ├──────────────────┤
                │ /api/suggestions │
                │ /api/critique    │
                │ /api/polish-jtbd │
                └────────┬─────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
  ┌──────────┐  ┌──────────────┐  ┌────────────┐
  │Scenarios │  │  Zod Schema  │  │ Agent.ai   │
  │ Database │  │  Validation  │  │ LLM API    │
  └──────────┘  └──────────────┘  └────────────┘
```

### 6.2 Client-Side Architecture (Web)

```
App.tsx (Router)
├── QueryClientProvider (React Query)
├── TooltipProvider (Radix UI)
└── Routes:
    ├── / → Home (Dashboard)
    │   └── Recent Work Display
    ├── /learn → LearnMode
    │   ├── Example Gallery
    │   ├── Swipe Handler
    │   └── Quiz
    ├── /build → BuildMode
    │   ├── Scenario Selection
    │   ├── Context Review
    │   ├── Multi-Step Wizard (WHAT → HOW MUCH → WHEN)
    │   ├── AI Suggestions Integration
    │   └── Review/Polish
    └── /critique → CritiqueMode
        ├── Statement Input
        ├── AI Analysis
        ├── Results Dashboard
        └── Feedback Display
```

### 6.3 Server-Side Architecture

```
server/index.ts (Entry Point)
├── Load dotenv
├── Express app setup
├── Middleware:
│   ├── JSON parser with rawBody
│   ├── Request logging
│   └── Error handling
├── Routes Registration (routes.ts)
│   ├── POST /api/suggestions
│   ├── POST /api/critique
│   └── POST /api/polish-jtbd
├── AI Service (ai-service.ts)
│   ├── callAgentAI()
│   ├── getSuggestions()
│   ├── critiqueJTBD()
│   └── polishJTBD()
├── Scenario Data (scenarios.ts)
│   ├── buildScenarios[]
│   └── getScenarioById()
└── HTTP Server on Port 5001
```

### 6.4 Data Persistence

**Web Application:**
- localStorage keys:
  - `jtbd-progress` - User progress tracking
  - `jtbd-built` - Built JTBDs history
  - `jtbd-critiques` - Critique history
  - `jtbd-quiz-results` - Quiz results
  - `view-built-jtbd` - Navigation state
  - `view-critique` - Navigation state

**Mobile Application:**
- AsyncStorage keys (same as web for consistency)

**Server:**
- Environment variables (dotenv)
- Potential Drizzle ORM database (configured, not actively used)

### 6.5 API Structure

#### POST /api/suggestions
```typescript
// Request
{
  scenarioId: string;        // e.g., "cto"
  step: "what" | "metrics" | "when";
  currentInput?: string;     // User's current input
}

// Response
{
  suggestions: string[];     // Array of 3 suggested options
}

// Flow
1. Mobile/Web sends minimal payload with scenario ID
2. Backend looks up full scenario context
3. Backend builds rich prompt with:
   - Role, company, industry, challenge
   - All situation bullet points
   - Value agenda
   - Current user input (if any)
4. Agent.ai (gpt4o) generates 3 suggestions
5. Returns suggestions array
```

#### POST /api/critique
```typescript
// Request
{
  jtbdStatement: string;     // User's JTBD statement to analyze
}

// Response
{
  overallStatus: "not-ready" | "needs-work" | "ready" | "exemplary";
  whatStatus: "missing" | "weak" | "strong" | "excellent";
  howMuchStatus: "missing" | "weak" | "strong" | "excellent";
  whenStatus: "missing" | "weak" | "strong" | "excellent";
  whatFeedback: string;
  howMuchFeedback: string;
  whenFeedback: string;
  whatSuggestions: string[];
  howMuchSuggestions: string[];
  whenSuggestions: string[];
  improvedVersion?: string;
}

// Flow
1. Web/Mobile sends JTBD statement
2. Server validates with Zod schema
3. Server sends to Agent.ai (claude-sonnet-4)
4. Claude analyzes and returns JSON critique
5. Server parses and returns structured response
```

#### POST /api/polish-jtbd
```typescript
// Request
{
  rawStatement: string;      // Raw JTBD components
}

// Response
{
  polishedStatement: string;  // Refined, cohesive sentence
}

// Purpose: Transform multi-line raw JTBD into elegant single statement
```

### 6.6 AI Integration Details

**Service:** Agent.ai (https://api-lr.agent.ai/v1/action/invoke_llm)

**Models Used:**
- `gpt4o` - For suggestions (faster, ~3-4 seconds)
- `claude-sonnet-4` - For critiques (more detailed, ~10-12 seconds)

**Backend Scenario Lookup Pattern:**
- Mobile app sends minimal payload: `{ scenarioId: "cto", step: "what" }`
- Backend looks up full scenario details from `/server/scenarios.ts`
- Builds rich context with:
  ```
  Role: Chief Technology Officer
  Company: GlobalCorp Industries
  Industry: Enterprise Tech
  Challenge: Legacy infrastructure
  Situation: [200+ legacy apps, $45M costs, ...]
  Value Agenda: Reduce IT costs 30%
  ```
- Includes full context in AI prompt
- AI generates contextually relevant suggestions

**Response Type Handling:**
- Suggestions endpoint returns array directly: `["suggestion 1", "suggestion 2"]`
- Critique endpoint returns object/string with JSON
- Code handles multiple response types for flexibility

---

## 7. Database Schema (Current State)

**Current Status:** Database infrastructure is configured (Drizzle ORM, Neon Database) but NOT actively used in the current implementation.

**Storage Strategy:**
- Frontend: localStorage (web) / AsyncStorage (mobile)
- Backend: Environment variables, no persistent DB queries in code

**Potential Future Schema** (based on Drizzle config):
- Users table (for authentication)
- JTBDs table (built statements)
- Critiques table (critique results)
- Progress table (user progress tracking)
- Quiz Results table (learning mode scores)

---

## 8. Configuration Files

### tsconfig.json
```json
{
  "include": ["client/src/**/*", "shared/**/*", "server/**/*"],
  "compilerOptions": {
    "strict": true,
    "module": "ESNext",
    "jsx": "preserve",
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

### vite.config.ts
```typescript
- Root: client directory
- Plugins: React, runtime error overlay
- Build output: dist/public
- Path aliases: @, @shared, @assets
```

### tailwind.config.ts
- Custom color palette
- Extended spacing and typography
- Dark mode configuration

### package.json (Root)
```
Scripts:
  - "dev": Development server with tsx (backend + Vite client)
  - "build": Build client + bundle server with esbuild
  - "start": Run production build
  - "check": TypeScript type checking
  - "db:push": Drizzle database sync
```

### drizzle.config.ts
- Database: Neon PostgreSQL
- Dialect: PostgreSQL
- Migrations directory: ./server/migrations

### .env.example
```
# Agent.ai API Configuration
AGENT_AI_API_KEY=your_agent_ai_api_key_here
```

### .replit
- Deployment configuration for Replit hosting

---

## 9. Key Design Patterns & Best Practices

### 9.1 Type Safety
- **Zod Schemas** for runtime validation
- **TypeScript strict mode** enabled
- Shared schema definitions between client and server
- Type inference with `z.infer<typeof schema>`

### 9.2 React Patterns
- **React Query** for server state management
- **Custom hooks** for business logic
- **Context API** for navigation (mobile) and global state
- **Component composition** with UI library (Radix, React Native Paper)
- **Controlled components** for forms

### 9.3 API Patterns
- **RESTful endpoints** with clear resource paths
- **Request/response validation** with Zod
- **Error handling** with try-catch and status codes
- **Caching strategies**:
  - React Query on client (cache + refetch)
  - useRef Map for local suggestion caching
  - localStorage/AsyncStorage for offline capability

### 9.4 Performance Optimizations
- **Lazy loading** of scenarios and examples
- **Request caching** to avoid duplicate API calls
- **Backend scenario lookup** to minimize payload size
- **Memoization** of expensive computations
- **CSS transforms** for GPU-accelerated animations

### 9.5 Security Considerations
- **API key on backend** (Agent.ai key never exposed to frontend)
- **Environment variables** with dotenv
- **HTTPS ready** (HTTP in dev, HTTPS in production)
- **.gitignore** excludes sensitive files

---

## 10. Recent Changes & Development Status

### Latest Updates (from REFACTORING_CHECKPOINTS.md)

**Session 1: COMPLETED**
- Added AI suggestions to Build Mode metrics and when steps
- Integrated with `/api/suggestions` endpoint
- Auto-populate fields when users select suggestions

**Session 2-6: PENDING/NOT STARTED**
- Implement API response caching
- Add Learn Mode resume functionality
- Performance optimizations
- Database integration
- Analytics tracking

### Current State
- Core functionality complete and working
- All three modes (Learn, Build, Critique) functional
- AI integration stable
- Web and mobile apps feature-parity achieved
- Recent Work/Dashboard implemented

### Known Issues
- None currently reported (last updated Nov 8, 2025)

---

## 11. Mobile vs Web Parity

### Shared Features
✓ Learn Mode (examples + quiz)
✓ Build Mode (7-stage wizard)
✓ Critique Mode (AI feedback)
✓ Recent Work Dashboard
✓ Progress Tracking
✓ AI Suggestions

### Differences
**Web:**
- Wouter routing
- Radix UI components
- Tailwind CSS styling
- Dark mode via next-themes

**Mobile:**
- React Navigation (native)
- React Native Paper
- Native styling
- Custom theme system

**Both:**
- Same business logic
- Same API integration
- Same data structures (via shared schema)
- Same scenarios and examples

---

## 12. Development Workflow

### Starting Backend
```bash
npm run dev
# Runs on http://0.0.0.0:5001
# Accessible from mobile: http://192.168.68.101:5001
```

### Starting Web App
```bash
npm run dev
# Vite dev server with hot reload
```

### Starting Mobile App
```bash
cd jtbd-mobile
npm start
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code for physical device
```

### Building for Production
```bash
npm run build
# Creates optimized web + server bundles
npm start
# Runs production server
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Add your Agent.ai API key
3. Update mobile API_BASE_URL if needed (in `queryClient.ts`)

---

## 13. Critical Implementation Details

### Backend Scenario Lookup (Key Pattern)
```typescript
// Mobile sends minimal payload
POST /api/suggestions
{
  scenarioId: "cto",
  step: "what",
  currentInput: ""
}

// Server does:
1. Receives scenarioId
2. Calls getScenarioById("cto") from scenarios.ts
3. Gets full scenario: role, company, size, situation[], valueAgenda
4. Builds rich prompt with all context
5. Sends to Agent.ai with claude instructions
6. Returns 3 suggestions

// Benefits:
- Small network payloads
- Rich AI context
- Single source of truth for scenario data
- Easy to update scenario content
```

### Caching Strategy
```typescript
// Mobile/Web build mode
const suggestionsCache = useRef(new Map<string, string[]>());
const cacheKey = JSON.stringify({ scenarioId, step, currentInput });
if (suggestionsCache.current.has(cacheKey)) {
  return cached; // Don't call API
}
// Make API call, then cache result
suggestionsCache.current.set(cacheKey, data.suggestions);
```

### Error Handling
```typescript
// Agent.ai returns HTTP 200 with status: 401 in body
if (data.status === 401) {
  throw new Error('Invalid API key');
}

// Response parsing flexibility
if (typeof aiResponse === 'object') {
  parsed = aiResponse;
} else if (typeof aiResponse === 'string') {
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  parsed = JSON.parse(jsonMatch[0]);
}
```

---

## 14. Deployment & Production Considerations

### Backend Deployment Options
- Render
- Railway
- Vercel
- AWS Lambda + API Gateway

### Required Env Variables
- `AGENT_AI_API_KEY` - Agent.ai API key
- `PORT` - Server port (default 5000, use 5001 for macOS)
- `NODE_ENV` - development or production

### Mobile App Deployment
- Update `API_BASE_URL` in `queryClient.ts` to production backend
- Build: `expo build:ios` / `expo build:android`
- Submit to App Store / Google Play

### HTTPS Configuration
- Local dev: HTTP only
- Production: HTTPS required
- Update API_BASE_URL to https://production-domain.com

---

## 15. Testing & Quality Assurance

### No automated tests configured (opportunity for enhancement)

**Manual Testing Checklist:**
- [ ] Learn mode example navigation
- [ ] Learn mode quiz functionality
- [ ] Build mode all 7 stages
- [ ] Build mode AI suggestions at each step
- [ ] Build mode statement polish
- [ ] Critique mode analysis
- [ ] Recent work dashboard updates
- [ ] Mobile app scenarios load correctly
- [ ] API endpoints return correct data

---

## 16. Future Enhancement Opportunities

Based on REFACTORING_CHECKPOINTS.md:

1. **API Response Caching** - Reduce redundant API calls
2. **Learn Mode Resume** - Save and resume learning progress
3. **Database Integration** - Move from localStorage to persistent DB
4. **Offline Mode** - Cache scenarios and examples for offline use
5. **Analytics** - Track user behavior and feature usage
6. **Rate Limiting** - Implement per-user API limits
7. **Error Retry Logic** - Automatic retry for failed Agent.ai calls
8. **User Authentication** - Login/signup functionality
9. **Admin Dashboard** - Manage scenarios and content
10. **Performance Monitoring** - Track API response times

---

## 17. Code Quality & Standards

### TypeScript
- Strict mode enabled
- Strong typing throughout
- Shared schema definitions

### React Best Practices
- Functional components with hooks
- Custom hooks for logic
- Proper dependency arrays
- Error boundaries (opportunity for enhancement)

### Component Organization
- Atomic design principles
- Reusable UI components
- Feature-based directory structure

### Styling
- Tailwind CSS for web (utility-first)
- Custom theme for mobile (native styling)
- Consistent design system

---

## 18. Important Files & Their Roles

| File | Purpose | Key Content |
|------|---------|-------------|
| `shared/schema.ts` | Type definitions | Zod schemas for all data types |
| `server/ai-service.ts` | AI integration | Agent.ai API calls, prompt engineering |
| `server/scenarios.ts` | Scenario data | 6 executive scenarios with context |
| `client/lib/storage.ts` | Web persistence | localStorage management |
| `jtbd-mobile/src/lib/storage.ts` | Mobile persistence | AsyncStorage management |
| `client/pages/build-mode.tsx` | Build wizard | 7-stage JTBD creation flow |
| `client/pages/critique-mode.tsx` | AI feedback | JTBD analysis and scoring |
| `client/data/jtbd-examples.ts` | Learning content | 10 good/bad JTBD examples |
| `jtbd-mobile/src/lib/queryClient.ts` | Mobile API config | API_BASE_URL and fetch setup |
| `.env.example` | Config template | API key requirement |

---

## Summary

JTBD Mastery is a **sophisticated, production-ready educational platform** that teaches users to write excellent JTBD statements through three interactive modes: Learn, Build, and Critique. The architecture is well-designed with:

- **Strong separation of concerns** (client, server, shared types)
- **Type-safe development** (TypeScript, Zod validation)
- **AI-powered features** (Agent.ai integration)
- **Cross-platform support** (Web, iOS, Android)
- **Responsive design** (mobile-first approach)
- **Performance optimizations** (caching, scenario lookup)
- **User tracking** (localStorage/AsyncStorage)

The codebase demonstrates **enterprise-grade patterns** and best practices, with clear documentation and a pragmatic development approach. It's ready for production deployment with minimal additional configuration.

