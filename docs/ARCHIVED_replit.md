# JTBD Mastery Studio

## Overview
An engaging Progressive Web App that teaches CEOWorks executives how to write excellent Jobs-to-be-Done (JTBD) statements through interactive learning. Built with React, Express, and AI-powered feedback.

## What is JTBD?
At CEOWorks, we identify the 1% of critical roles that deliver 80% of enterprise value. For each role, we define 3-5 "Jobs To Be Done" - specific, measurable work that must be accomplished.

### The JTBD Formula
1. **WHAT** - Specific work to be done (action verbs, not vague goals)
2. **HOW MUCH** - Measurable outcomes with before/after metrics
3. **WHEN** - Clear deadline or timeframe (3-5 year strategic view)

### The "Glass Slipper" Test
"If you can Google it, it's NOT a JTBD." JTBDs must be so bespoke and specific that they exclude 95% of candidates.

## Features

### MODE 1: LEARN (Pattern Recognition)
- **10 Real Examples**: Swipeable cards showing bad vs good JTBDs side-by-side
- **Split-Screen Comparison**: Red (bad) vs Green (good) with detailed analysis
- **Interactive Quiz**: 5 questions testing pattern recognition
- **Touch Gestures**: Swipe left/right to navigate, tap to reveal analysis
- **Progress Tracking**: Automatically saves examples viewed and quiz scores

### MODE 2: BUILD (Guided Creation)
- **6 Scenarios**: Choose from VP Operations, CTO, Head of Sales, CFO, CMO, CHRO
- **Step-by-Step Wizard**: 
  1. Context - Understand the business situation
  2. WHAT - Define specific work with AI suggestions
  3. HOW MUCH - Add measurable metrics (before → after)
  4. WHEN - Set strategic deadline
  5. Review - See assembled JTBD
- **AI Assistance**: GPT-4o generates contextual suggestions for each step
- **Real-time Validation**: Character counts, requirement checks, live preview

### MODE 3: CRITIQUE (AI Coach)
- **AI Analysis**: Claude Sonnet 4 provides comprehensive scoring
- **Component Breakdown**: Individual scores for WHAT, HOW MUCH, WHEN
- **Detailed Feedback**: Specific suggestions for improvement
- **Improved Version**: AI generates enhanced JTBD if score < 80
- **Visual Scoring**: Score rings and progress bars with color-coded feedback

## Technical Stack

### Frontend
- **React** + **TypeScript** - Type-safe component development
- **Wouter** - Lightweight routing
- **Framer Motion** - Smooth animations and swipe gestures
- **TanStack Query** - API state management
- **Shadcn UI** - Beautiful component library
- **Tailwind CSS** - Utility-first styling
- **PWA** - Installable, offline-capable app

### Backend
- **Express.js** - REST API server
- **Agent.ai Integration**:
  - Claude Sonnet 4 for comprehensive JTBD analysis
  - GPT-4o for quick contextual suggestions
- **Environment**: AGENT_AI_API_KEY for AI service

### Data & Storage
- **TypeScript Schemas** - Zod validation for all data
- **LocalStorage** - Progress tracking, built JTBDs, critique history
- **In-Memory** - Session data during active use
- **Service Worker** - Offline caching for Learn mode

## Design System

### Colors (CEOWorks Branding)
- **Primary**: #ff6b35 (Vibrant Orange) - Actions, highlights, energy
- **Deep Blue**: #1a365d (hsl 210 65% 23%) - Authority, trust, branding
- **Success Green**: hsl(142 71% 45%) - Correct answers, good JTBDs
- **Error Red**: hsl(0 84% 60%) - Wrong answers, bad JTBDs
- **Warning Amber**: hsl(38 92% 50%) - Partial credit, improvements

### Typography
- **Font**: Inter - Modern, clean, executive-friendly
- **Mono**: JetBrains Mono - For code/JTBD structure examples
- **Hierarchy**: 
  - Hero: 2.5rem mobile / 3.5rem desktop
  - Headers: 1.75rem mobile / 2.25rem desktop
  - Body: 1rem mobile / 1.125rem desktop

### Spacing
- **Tight**: 8px - Within components
- **Standard**: 16px - Between related elements
- **Generous**: 32px - Between sections

### Interactions
- **Animations**: < 400ms for snappy feel
- **Hover**: Scale(1.02), 150ms ease
- **Active**: Scale(0.98), 100ms feedback
- **Swipe**: Follow finger with elastic resistance

## Project Structure

```
client/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── mode-card.tsx  # Dashboard mode selection
│   │   ├── progress-bar.tsx
│   │   └── score-ring.tsx # Circular progress indicator
│   ├── data/              # Static content
│   │   ├── jtbd-examples.ts    # 10 real examples
│   │   ├── quiz-questions.ts   # 5 quiz questions
│   │   └── build-scenarios.ts  # 6 guided scenarios
│   ├── lib/
│   │   ├── queryClient.ts      # TanStack Query setup
│   │   └── storage.ts          # LocalStorage helpers
│   ├── pages/
│   │   ├── home.tsx            # Dashboard with 3 modes
│   │   ├── learn-mode.tsx      # Swipeable examples + quiz
│   │   ├── build-mode.tsx      # Step-by-step wizard
│   │   └── critique-mode.tsx   # AI analysis interface
│   └── App.tsx            # Routes and providers

server/
├── ai-service.ts          # Agent.ai integration
├── routes.ts              # API endpoints
└── storage.ts             # Data interfaces

shared/
└── schema.ts              # TypeScript types + Zod schemas

public/
├── manifest.json          # PWA configuration
└── sw.js                  # Service worker for offline
```

## API Endpoints

### POST /api/critique
Analyze a JTBD statement with Claude Sonnet 4
```typescript
Request: { jtbdStatement: string }
Response: {
  overallScore: number,
  whatScore: number,
  howMuchScore: number,
  whenScore: number,
  whatFeedback: string,
  howMuchFeedback: string,
  whenFeedback: string,
  suggestions: string[],
  improvedVersion?: string
}
```

### POST /api/suggestions
Get AI suggestions for building JTBDs with GPT-4o
```typescript
Request: {
  scenarioId: string,
  step: 'what' | 'metrics' | 'when',
  currentInput?: string
}
Response: {
  suggestions: string[]
}
```

## Development

### Running Locally
```bash
npm run dev  # Starts Express backend + Vite frontend on port 5000
```

### Environment Variables
- `AGENT_AI_API_KEY` - Required for AI features (Claude Sonnet 4, GPT-4o)
- `SESSION_SECRET` - Session management

## PWA Features
- **Installable**: Add to home screen on mobile
- **Offline Learn Mode**: 10 examples + quiz work without internet
- **Auto-Updates**: Service worker checks for new versions
- **Progress Persistence**: All data saved locally

## User Flow

1. **Dashboard**: Choose LEARN, BUILD, or CRITIQUE
2. **Learn Path**:
   - Intro → 10 Swipeable Cards → Quiz → Summary
   - Progress auto-saved after each card
3. **Build Path**:
   - Intro → Choose Scenario → Context → Step 1-3 → Review
   - AI suggestions available at each step
4. **Critique Path**:
   - Paste JTBD → Get Analysis → View Scores & Suggestions
   - Each critique tracked in progress

## Recent Changes (October 23, 2025)
- ✅ Implemented all three modes with full functionality
- ✅ Added swipe gestures for Learn mode cards
- ✅ Connected Build mode to AI suggestions API
- ✅ Integrated Claude Sonnet 4 for JTBD critique
- ✅ Added localStorage persistence for progress
- ✅ Created PWA manifest and service worker
- ✅ Implemented CEOWorks design system
- ✅ Added comprehensive data (10 examples, 5 quiz questions, 6 scenarios)

## Architecture Decisions
- **Client-side storage**: Optimal for MVP, enables offline mode
- **AI models**: Claude Sonnet 4 for deep analysis (high accuracy), GPT-4o for quick suggestions (speed)
- **Framer Motion**: Provides both animations and swipe gesture handling
- **Component-first**: Reusable UI components for consistency
- **TypeScript everywhere**: Type safety from schema to UI

## Known Limitations
- AI features require internet (gracefully degrade with fallback hints)
- Progress not synced across devices (localStorage only)
- 10 examples hardcoded (sufficient for learning patterns)

## Future Enhancements
- User authentication for multi-device sync
- Team collaboration features
- Custom company/role scenarios
- More detailed analytics dashboard
- Admin panel for content management
