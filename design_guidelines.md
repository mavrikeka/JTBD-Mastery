# JTBD Mastery Studio - Design Guidelines

## Design Approach

**Reference-Based:** Drawing inspiration from premium educational platforms (Duolingo's gamification, Linear's polish, Notion's clarity) while maintaining executive-level sophistication. This is a professional learning tool disguised as an engaging game—balancing playfulness with credibility.

**Key Principle:** "Executive Gamification" - make learning feel rewarding and fun without sacrificing professional credibility.

---

## Core Design Elements

### A. Color Palette

**Primary Colors:**
- **Deep Blue** (210 65% 23%) - Brand authority, trust, professionalism
- **Vibrant Orange** (14 100% 60%) - Energy, progress, achievements

**Functional Colors:**
- **Success Green** (142 71% 45%) - Correct answers, good JTBDs, progress
- **Error Red** (0 84% 60%) - Wrong answers, bad JTBDs, areas to improve
- **Warning Amber** (38 92% 50%) - Partial credit, improvement needed

**Surface Colors (Dark Mode):**
- **Background Base** (210 25% 8%) - Main app background
- **Card Surface** (210 20% 12%) - Elevated cards and panels
- **Card Elevated** (210 18% 16%) - Hover states, active cards
- **Subtle Border** (210 15% 20%) - Dividers and outlines

**Text Colors:**
- **Primary Text** (210 10% 95%) - Headlines, body text
- **Secondary Text** (210 10% 70%) - Descriptions, metadata
- **Muted Text** (210 10% 50%) - Hints, placeholders

### B. Typography

**Font Families:**
- **Headlines:** Inter (700-800 weight) - Modern, clean, executive-friendly
- **Body Text:** Inter (400-500 weight) - Excellent readability
- **Mono/Code:** JetBrains Mono (for JTBD examples showing structure)

**Scale:**
- **Hero/Mode Titles:** 2.5rem (mobile) / 3.5rem (desktop)
- **Section Headers:** 1.75rem (mobile) / 2.25rem (desktop)
- **Card Titles:** 1.25rem (mobile) / 1.5rem (desktop)
- **Body Text:** 1rem (mobile) / 1.125rem (desktop)
- **Small/Meta:** 0.875rem

**Line Height:** 1.6 for body text, 1.2 for headlines

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- **Tight spacing:** p-2, gap-2 (8px) - Within components
- **Standard spacing:** p-4, gap-4 (16px) - Between related elements
- **Generous spacing:** p-8, gap-8 (32px) - Between sections
- **Section breaks:** py-16, py-20 (64-80px) - Major visual separations

**Container Widths:**
- Mobile: Full width with px-4 padding
- Tablet: max-w-2xl (672px)
- Desktop: max-w-4xl (896px) for main content
- Full-width mode selection: max-w-7xl (1280px)

**Grid Patterns:**
- Mode cards: 1 column (mobile), 3 columns (desktop) with gap-6
- Example cards: Single column focus for readability
- Progress stats: 2-3 columns for metrics display

### D. Component Library

#### Navigation
- **Top Bar:** Sticky header with logo, current mode indicator, and progress stats
- **Bottom Nav (Mobile):** Fixed bottom navigation for mode switching with active state indicators
- **Back Button:** Consistent top-left placement with smooth transitions

#### Cards & Surfaces
- **Mode Selection Cards:** Large, touch-friendly cards (min-height: 200px) with icon, title, description, and "Start" CTA
- **JTBD Example Cards (Learn Mode):** Full-screen swipeable cards with split-screen bad/good comparison, tap-to-reveal analysis overlay
- **Progress Cards:** Compact metric displays showing scores, completion %, and streaks
- **Analysis Panel (Critique Mode):** Detailed breakdown card with component-by-component scoring

#### Interactive Elements
- **Primary Button:** Orange background, white text, rounded-lg, generous padding (py-3 px-8)
- **Secondary Button:** Blue background, white text, same sizing as primary
- **Ghost Button:** Transparent with border, white text, for less prominent actions
- **Swipe Gestures:** Left swipe = "This is bad", Right swipe = "This is good" with visual feedback
- **Touch Targets:** Minimum 44px height for all interactive elements

#### Forms & Inputs
- **Text Areas:** Dark card surface (210 20% 12%), white text, rounded borders, focus state with orange outline
- **Input Labels:** Orange accent color, small caps, letter-spacing
- **Validation States:** Inline feedback with green checkmark or red warning icon

#### Feedback & Gamification
- **Score Display:** Large, prominent numbers with animated count-up on achievements
- **Progress Bars:** Orange fill on blue background, smooth width transitions
- **Celebration Animations:** Confetti effect for mode completion, checkmark bounce for correct answers
- **Encouragement Messages:** Toast notifications with friendly copy ("Great eye!" "Almost there!" "JTBD Master!")

#### Data Display
- **Comparison View (Learn Mode):** Split screen with red tint (left) for bad examples, green tint (right) for good examples
- **Analysis Overlay:** Slide-up modal with blur backdrop, checkmarks/x-marks for each JTBD component
- **Score Breakdown:** Circular progress rings showing % completion for WHAT/HOW MUCH/WHEN

### E. Animations & Transitions

**Micro-interactions:**
- Button hover: Scale(1.02) with 150ms ease
- Card tap: Scale(0.98) for 100ms feedback
- Swipe: Follow finger position with resistance at edges
- Input focus: Orange glow appearing in 200ms

**Page Transitions:**
- Mode switch: Fade-out current (200ms), fade-in new (300ms) with 100ms delay
- Card flip: 3D rotate effect (400ms) when revealing analysis
- Modal appear: Slide-up from bottom (300ms) with backdrop fade-in

**Progress Feedback:**
- Score increment: Number count-up animation (800ms)
- Progress bar fill: Smooth width transition (600ms ease-out)
- Achievement unlock: Bounce + glow effect (500ms)

**Performance:** Keep animations subtle and fast (< 400ms) to maintain snappy feel. Use CSS transforms and opacity for GPU acceleration.

---

## Mode-Specific Design Patterns

### MODE 1: LEARN (Pattern Recognition)
- **Full-screen card experience** inspired by Tinder's focus mode
- **Split comparison layout:** Vertical split on mobile, preserve on desktop for consistency
- **Swipe affordance:** Subtle left/right arrows, "Swipe to continue" hint on first card
- **Analysis reveal:** Tap anywhere triggers slide-up overlay with detailed breakdown
- **Progress indicator:** Top of screen showing "3 of 10" with filled/unfilled dots

### MODE 2: BUILD (Guided Creation)
- **Multi-step wizard:** 4 steps (Context → WHAT → HOW MUCH → WHEN) with progress stepper
- **AI suggestion cards:** Floating suggestions appearing below input with "Use this" quick action
- **Real-time validation:** Green checkmarks appearing as requirements are met
- **Preview panel:** Live JTBD preview updating as user types
- **Navigation:** Previous/Next buttons, ability to jump back to edit earlier steps

### MODE 3: CRITIQUE (AI Feedback)
- **Input first:** Large text area with placeholder showing good JTBD example
- **Analyze button:** Prominent orange CTA, loading state with progress indicator
- **Results dashboard:** Three-column breakdown (WHAT score, HOW MUCH score, WHEN score)
- **Detailed feedback cards:** Expandable sections for each component with specific improvement suggestions
- **Edit & Resubmit:** Quick way to revise and re-analyze

---

## Images

**No hero image required** - this is an app-style interface, not a marketing site. All visual interest comes from:
- Colorful mode selection cards with custom icons
- Animated progress indicators and gamification elements
- Split-screen example comparisons with color coding
- Dynamic score visualizations and charts

**Icon Usage:** Use Heroicons for UI elements (arrows, checkmarks, x-marks). Custom illustrative icons for mode selection (lightbulb for Learn, hammer for Build, magnifying glass for Critique) - can be simple outlined SVGs matching the design system.

---

## Mobile-First Considerations

- **Thumb Zone Optimization:** Place primary actions in bottom 1/3 of screen
- **Gesture Priority:** Swipe > Tap > Scroll for Learn mode hierarchy
- **Touch Targets:** Minimum 44x44px, spacing of at least 8px between
- **Viewport Usage:** Use full available height for card experiences, avoid forcing 100vh which causes issues with browser chrome
- **Font Scaling:** Test at 200% zoom for accessibility
- **Offline Support:** Show clear indicators when AI features unavailable, cache Learn mode content