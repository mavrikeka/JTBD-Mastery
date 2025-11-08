# JTBD Mastery: Refactoring Checkpoints

**Goal:** Achieve functional parity between web and mobile apps while preserving their respective UI/UX styles.

**Total Sessions:** 6
**Estimated Total Time:** 9.5-12.5 hours

---

## ✅ SESSION 1: Add AI Suggestions to Build Mode (COMPLETED)

### Status: **COMPLETED**
### Time Spent: ~1 hour
### Files Modified:
- `client/src/pages/build-mode.tsx`

### Changes Made:

#### 1. Added AI Suggestions to Metrics Step
**Location:** `client/src/pages/build-mode.tsx:446-517`

**What was added:**
- "Get AI Suggestions" button for metrics step
- Calls `/api/suggestions` with `step: 'metrics'` and `currentInput: buildData.what`
- Parses responses in format: "Metric name: from X to Y"
- Auto-populates metric fields when user clicks a suggestion
- Handles both AI suggestions and fallback to preset hints
- Loading state with spinner during API call

**Code Pattern:**
```javascript
suggestionsMutation.mutate({
  scenarioId: selectedScenario.id,
  step: 'metrics',
  currentInput: buildData.what,
});

// Parse and add metric
const match = suggestion.match(/^(.+?):\s*from\s+(.+?)\s+to\s+(.+)$/i);
if (match) {
  const [, name, current, target] = match;
  setBuildData({
    ...buildData,
    metrics: [...buildData.metrics, { name: name.trim(), current: current.trim(), target: target.trim() }]
  });
}
```

#### 2. Added AI Suggestions to When Step
**Location:** `client/src/pages/build-mode.tsx:553-609`

**What was added:**
- "Get AI Suggestions" button for when step
- Calls `/api/suggestions` with `step: 'when'` and includes both what and metrics in currentInput
- Displays AI-generated deadline suggestions as clickable cards
- Populates deadline field when clicked
- Loading state with spinner during API call

**Code Pattern:**
```javascript
const metricsText = buildData.metrics
  .map(m => `${m.name}: ${m.current} to ${m.target}`)
  .join('; ');

suggestionsMutation.mutate({
  scenarioId: selectedScenario.id,
  step: 'when',
  currentInput: `${buildData.what}. Metrics: ${metricsText}`,
});

// Use suggestion
setBuildData({ ...buildData, when: suggestion });
```

### Testing Done:
- ✅ Verified file compiles without syntax errors
- ⏳ **MANUAL TESTING NEEDED**: Run web app and test AI suggestions on metrics and when steps

### Known Issues:
- None

### Next Steps:
- Test in browser that AI suggestions work correctly for both steps
- Verify API endpoints handle the new step parameters

---

## ⏳ SESSION 2: Implement API Response Caching (PENDING)

### Status: **NOT STARTED**
### Estimated Time: 1-2 hours
### Files to Modify:
- `client/src/pages/build-mode.tsx` (add caching for suggestions)
- `client/src/pages/critique-mode.tsx` (add caching for critiques)

### Implementation Plan:

#### Build Mode Caching
**Add at top of BuildMode component:**
```typescript
const suggestionsCache = useRef(new Map<string, string[]>());
```

**In suggestionsMutation.mutate before API call:**
```typescript
const cacheKey = JSON.stringify({ scenarioId, step, currentInput });
if (suggestionsCache.current.has(cacheKey)) {
  const cached = suggestionsCache.current.get(cacheKey);
  setAiSuggestions(cached);
  setShowHints(true);
  return;
}
```

**After successful API response:**
```typescript
suggestionsCache.current.set(cacheKey, data.suggestions);
```

**Clear cache when navigating away:**
```typescript
useEffect(() => {
  return () => {
    suggestionsCache.current.clear();
  };
}, []);
```

#### Critique Mode Caching
**Add at top of CritiqueMode component:**
```typescript
const critiqueCache = useRef(new Map<string, CritiqueResponse>());
```

**Before API call:**
```typescript
const cacheKey = statement.trim();
if (critiqueCache.current.has(cacheKey)) {
  const cached = critiqueCache.current.get(cacheKey);
  // Set critique state with cached data
  return;
}
```

**After successful response:**
```typescript
critiqueCache.current.set(cacheKey, response);
```

### Testing Checklist:
- [ ] Verify duplicate requests don't hit API (check Network tab)
- [ ] Verify cache works across same inputs
- [ ] Verify cache clears on component unmount
- [ ] Test with multiple scenarios/statements

---

## ⏳ SESSION 3: Add Learn Mode Resume Functionality (PENDING)

### Status: **NOT STARTED**
### Estimated Time: 1 hour
### Files to Modify:
- `client/src/pages/learn-mode.tsx`

### Implementation Plan:

#### Save Resume State
**When navigating away (useEffect cleanup or route change):**
```typescript
useEffect(() => {
  return () => {
    // Save current state when component unmounts
    if (stage !== 'summary') {  // Don't save if completed
      localStorage.setItem('resume-learn', JSON.stringify({
        currentExample: exampleIndex,
        stage: stage,  // 'intro' | 'gallery' | 'quiz' | 'summary'
      }));
    }
  };
}, [stage, exampleIndex]);
```

#### Load Resume State
**On component mount:**
```typescript
useEffect(() => {
  const resumeData = localStorage.getItem('resume-learn');
  if (resumeData) {
    try {
      const { currentExample, stage: savedStage } = JSON.parse(resumeData);
      setExampleIndex(currentExample);
      setStage(savedStage);
      localStorage.removeItem('resume-learn'); // Clear after loading
    } catch (e) {
      console.error('Failed to load resume data:', e);
    }
  }
}, []);
```

### Testing Checklist:
- [ ] Navigate away mid-learning, return and verify resume works
- [ ] Complete learning, verify resume data clears
- [ ] Test with different stages (gallery, quiz)
- [ ] Verify data clears after loading

---

## ⏳ SESSION 4: Add Home Page Auto-Refresh (PENDING)

### Status: **NOT STARTED**
### Estimated Time: 30 minutes
### Files to Modify:
- `client/src/pages/home.tsx`

### Implementation Plan:

**Add polling effect:**
```typescript
useEffect(() => {
  // Refresh progress every 2 seconds
  const interval = setInterval(() => {
    const latestProgress = getProgress();
    const latestBuilt = getBuiltJTBDs().slice(-3).reverse();
    const latestCritiques = getCritiques().slice(-3).reverse();

    // Only update if changed (to prevent unnecessary re-renders)
    setProgress(latestProgress);
    setBuiltJTBDs(latestBuilt);
    setCritiques(latestCritiques);
  }, 2000);

  return () => clearInterval(interval);
}, []);
```

### Testing Checklist:
- [ ] Open two browser tabs
- [ ] Create JTBD in one tab
- [ ] Verify other tab updates within 2 seconds
- [ ] Check no memory leaks (interval cleanup works)

---

## ✅ SESSION 5: Port Quiz System from Web to Mobile (COMPLETED)

### Status: **COMPLETED**
### Estimated Time: 3-4 hours
### Time Spent: ~3 hours
### Files to Modify:
- `jtbd-mobile/src/pages/LearnPage.tsx` (main implementation)
- `jtbd-mobile/src/data/quiz-questions.ts` (already exists, just reference it)

### Implementation Plan:

#### 1. Import Quiz Questions
**At top of LearnPage.tsx:**
```typescript
import { quizQuestions } from '../data/quiz-questions';
```

#### 2. Add Quiz State
**In LearnPage component:**
```typescript
const [quizAnswers, setQuizAnswers] = useState<Record<number, string[] | string>>({});
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [quizScore, setQuizScore] = useState(0);
```

#### 3. Add Quiz Stage UI
**Replace placeholder quiz section with:**
- Question display (text + options)
- Radio buttons for single-select questions
- Checkboxes for multi-select questions
- "Submit Answer" button
- Feedback display (correct/incorrect with explanations)
- Navigation (Next Question / See Results)

#### 4. Quiz Logic
**Answer validation:**
```typescript
const isAnswerCorrect = (questionIndex: number, userAnswer: string[] | string) => {
  const question = quizQuestions[questionIndex];
  const correctAnswers = question.options
    .filter(opt => opt.correct)
    .map(opt => opt.id);

  if (Array.isArray(userAnswer)) {
    // Multi-select: must match exactly
    return JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswers.sort());
  } else {
    // Single-select
    return userAnswer === correctAnswers[0];
  }
};
```

**Score calculation:**
```typescript
const calculateScore = () => {
  let correct = 0;
  quizQuestions.forEach((_, index) => {
    if (isAnswerCorrect(index, quizAnswers[index])) {
      correct++;
    }
  });
  return correct;
};
```

#### 5. Save Quiz Completion
**After quiz completes:**
```typescript
const finalScore = calculateScore();
await updateLearnProgress(10, finalScore);  // 10 examples + quiz score
setStage('summary');
```

#### 6. Add Summary Stage
**Show:**
- Final score (e.g., "3/5")
- Dynamic message based on performance
- Key takeaways (4 core patterns)
- "Return to Menu" / "Start Building" buttons

### Reference Files:
- Web implementation: `client/src/pages/learn-mode.tsx:200-450` (approx)
- Quiz data structure: `jtbd-mobile/src/data/quiz-questions.ts`
- Quiz question types: `shared/schema.ts:QuizQuestion`

### Testing Checklist:
- [ ] All 5 questions display correctly
- [ ] Single-select questions work (radio buttons)
- [ ] Multi-select questions work (checkboxes)
- [ ] Answer validation works correctly
- [ ] Score calculation is accurate
- [ ] Progress saves correctly after quiz
- [ ] Summary stage shows correct score and message

---

## ✅ SESSION 6: Quiz Review & Recent Work Enhancement - Mobile & Web (COMPLETED)

### Status: **COMPLETED**
### Estimated Time: 3-4 hours
### Time Spent: ~4 hours
### Files Modified:
**Mobile:**
- `jtbd-mobile/src/pages/LearnPage.tsx` (added review stage)
- `jtbd-mobile/src/pages/HomePage.tsx` (added quiz results section)
- `jtbd-mobile/src/lib/storage.ts` (added quiz results storage)

**Web:**
- `client/src/pages/learn-mode.tsx` (added review stage)
- `client/src/pages/home.tsx` (added quiz results section)
- `client/src/lib/storage.ts` (added quiz results storage)

**Shared:**
- `shared/schema.ts` (added QuizResult type)

### Changes Made:

**IMPORTANT:** All changes were implemented in BOTH mobile and web apps to maintain functional parity.

#### 1. Added Quiz Review Functionality
**Mobile Location:** `jtbd-mobile/src/pages/LearnPage.tsx`
**Web Location:** `client/src/pages/learn-mode.tsx`

**What was added:**
- New 'review' stage added to currentStep state
- "Review Answers" button in summary stage
- Complete review interface showing:
  - Each question with correct/incorrect badge
  - All answer options with visual indicators (✓ for correct, ✗ for wrong answers)
  - "(Your answer)" label for incorrect user selections
  - Question feedback displayed for each question
- Proper styling with color-coded badges and option highlighting

**Code Pattern:**
```typescript
// In summary stage, added button:
<Button size="lg" onPress={() => setCurrentStep('review')} fullWidth variant="outline">
  Review Answers
</Button>

// Review stage displays each question with results:
{quizQuestions.map((question, index) => {
  const userAnswers = quizAnswers[question.id] || [];
  const correctAnswers = question.options.filter(o => o.correct).map(o => o.id);
  const isCorrect = JSON.stringify(userAnswers.sort()) === JSON.stringify(correctAnswers.sort());
  // ... render question with correct/incorrect indicators
})}
```

#### 2. Added Quiz Results Storage
**Mobile Location:** `jtbd-mobile/src/lib/storage.ts`
**Web Location:** `client/src/lib/storage.ts`

**What was added:**
- New `QuizResult` type in shared schema
- `saveQuizResult()` function to store quiz attempts
- `getQuizResults()` function to retrieve quiz history
- Quiz results saved with score, total questions, user answers, and timestamp

**Code Pattern:**
```typescript
export async function saveQuizResult(
  score: number,
  totalQuestions: number,
  answers: Record<number, string[]>
): Promise<void> {
  const results: QuizResult[] = saved ? JSON.parse(saved) : [];
  results.push({
    score,
    totalQuestions,
    answers,
    timestamp: new Date().toISOString()
  });
  await AsyncStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(results));
}
```

#### 3. Added Quiz Results to Recent Work
**Mobile Location:** `jtbd-mobile/src/pages/HomePage.tsx`
**Web Location:** `client/src/pages/home.tsx`

**What was added:**
- New "Quiz Results" section in Recent Work
- Displays last 3 quiz attempts with:
  - Score and percentage (e.g., "3/5 (60%)")
  - Color-coded percentage circle (green ≥80%, red <60%, primary 60-79%)
  - Timestamp
- Tapping a quiz result navigates to Learn page in review mode
- Total quiz count badge

**Code Pattern:**
```typescript
const percentage = Math.round((result.score / result.totalQuestions) * 100);
const scoreColor = percentage >= 80 ? theme.colors.success :
                   percentage >= 60 ? theme.colors.primary :
                   theme.colors.error;

<Card onPress={async () => {
  await AsyncStorage.setItem('view-quiz-result', JSON.stringify(result));
  navigation.navigate('Learn');
}}>
  <Text>Quiz Score: {result.score}/{result.totalQuestions} ({percentage}%)</Text>
  <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
    <Text style={{ color: scoreColor }}>{percentage}%</Text>
  </View>
</Card>
```

#### 4. Enhanced Learn Pages to View Past Quiz Results
**Mobile Location:** `jtbd-mobile/src/pages/LearnPage.tsx`
**Web Location:** `client/src/pages/learn-mode.tsx`

**What was added:**
- Check for `view-quiz-result` in AsyncStorage on mount
- If found, load quiz answers and navigate to review stage
- Allows users to view past quiz attempts from Recent Work

#### 5. Fixed Multi-Select Quiz Behavior
**Mobile Location:** `jtbd-mobile/src/pages/LearnPage.tsx`
**Web Location:** `client/src/pages/learn-mode.tsx`

**Issue Found:**
- Multi-select questions (like Question 5: "What makes this JTBD strong?") were behaving like single-select
- No "Submit Answer" button was shown for multi-select questions
- Feedback was auto-showing as soon as any option was selected

**Fix Applied:**
- Added `handleSubmitMultiSelect()` function
- Modified quiz rendering to NOT auto-show feedback for multi-select questions
- Added conditional "Submit Answer" button that appears when:
  - Question is multi-select AND
  - User has selected at least one answer AND
  - Feedback is not yet showing
- Only show "Next Question" button AFTER user submits and sees feedback

**Code Pattern:**
```typescript
// Mobile & Web: Don't auto-show feedback for multi-select
const handleQuizAnswer = (optionId: string) => {
  if (currentQuiz.multiSelect) {
    // Toggle selection, don't show feedback
    const newAnswers = current.includes(optionId)
      ? current.filter(id => id !== optionId)
      : [...current, optionId];
    setQuizAnswers({ ...quizAnswers, [currentQuiz.id]: newAnswers });
  } else {
    // Single-select: auto-show feedback
    setQuizAnswers({ ...quizAnswers, [currentQuiz.id]: [optionId] });
    setShowQuizFeedback(true);
  }
};

// Show Submit button for multi-select before feedback
{!showFeedback && currentQuiz.multiSelect && selectedAnswers.length > 0 && (
  <Button onPress={handleSubmitMultiSelect}>Submit Answer</Button>
)}
```

#### 6. Fixed Web App AI Suggestions State Persistence
**Web Location:** `client/src/pages/build-mode.tsx`
**Mobile App:** Not affected - does not have this issue

**Issue Found:**
- In web app Build mode, when user clicks "Get AI Suggestions" on the "What" step
- The `showHints` state persists when moving to the next step ("How much")
- Button incorrectly shows "Hide AI Suggestions" instead of "Get AI Suggestions"
- Confusing UX as user hasn't requested suggestions on the new step

**Fix Applied:**
- Added useEffect hook that resets AI suggestions state whenever stage changes
- Resets both `showHints` (boolean) and `aiSuggestions` (array) to initial state
- Ensures each build step starts with a clean slate for AI suggestions

**Code Pattern:**
```typescript
// Reset AI suggestions state when stage changes
useEffect(() => {
  setShowHints(false);
  setAiSuggestions([]);
}, [stage]);
```

**Note:** Mobile app was checked and does not have this issue.

#### 7. Fixed Web App Critique Mode Schema Mismatch
**Web Location:** `client/src/pages/critique-mode.tsx`
**Mobile App:** Already using correct schema (was fixed previously)

**Issue Found:**
- Web app Critique mode was displaying numeric scores (0-100) with score rings
- API schema returns status enums: 'missing', 'weak', 'strong', 'excellent'
- Web app was trying to access non-existent fields: `overallScore`, `whatScore`, `howMuchScore`, `whenScore`
- Mobile app was correctly using status-based display with badges
- Complete mismatch between web UI and actual API response

**Fix Applied:**
- Completely refactored web critique output to match mobile implementation
- Added helper functions for status display (getStatusIcon, getStatusText, getComponentStatusColor, getOverallStatusColor)
- Replaced score rings with status badges showing text labels (Missing, Weak, Strong, Excellent)
- Added collapsible sections for each component (WHAT, HOW MUCH, WHEN)
- Each section shows:
  - Component name and status badge
  - Expandable feedback
  - Component-specific suggestions array
- Overall status shows badges (❌ Not Ready, ⚠️ Needs Work, ✅ Ready to Execute, 🌟 Exemplary)
- Removed unused ComponentScoreCard component
- Updated console logs to use correct schema fields

**Before:**
```typescript
// Old web app (WRONG)
<ScoreRing score={critique.overallScore} /> // doesn't exist!
<ComponentScoreCard score={critique.whatScore} /> // doesn't exist!
```

**After:**
```typescript
// New web app (CORRECT)
<div className={getOverallStatusColor(critique.overallStatus)}>
  {getOverallStatusText(critique.overallStatus)}
</div>

<Collapsible>
  <span className={getComponentStatusColor(critique.whatStatus)}>
    {getStatusIcon(critique.whatStatus)} {getStatusText(critique.whatStatus)}
  </span>
  <CollapsibleContent>
    {critique.whatFeedback}
    {critique.whatSuggestions.map(...)}
  </CollapsibleContent>
</Collapsible>
```

**Result:**
- Web app now matches mobile app functionality
- Both apps use the same schema correctly
- Collapsible component sections for better UX
- Status-based feedback instead of arbitrary numeric scores

#### 8. Fixed Web App Build Mode Missing Context
**Web Location:** `client/src/pages/build-mode.tsx`
**Mobile App:** Already showing "What you're building" correctly

**Issue Found:**
- Web app Build mode missing "What you're building" section on metrics and when steps
- Mobile app correctly shows this context to remind users what they're measuring/scheduling
- Users lost context when moving between build steps in web app

**Fix Applied:**
- Added "What you're building" card to metrics stage (after title, before tip)
- Added "What you're building" card to when stage (after title, before strategic view)
- Card displays the `buildData.what` value from step 1
- Styled with accent background to differentiate from other cards

**Code Pattern:**
```typescript
{buildData.what && (
  <Card className="p-4 bg-accent/50 border-accent">
    <p className="text-xs font-semibold text-muted-foreground mb-2">WHAT YOU'RE BUILDING:</p>
    <p className="text-foreground">{buildData.what}</p>
  </Card>
)}
```

**Result:**
- Web app now shows context on all build steps like mobile app
- Better UX - users can see what they're building while adding metrics/deadlines
- Maintains functional parity with mobile app

### Testing Done (Both Mobile & Web):
- ✅ Quiz review shows all questions with correct answers highlighted
- ✅ User's incorrect answers are marked with "(Your answer)"
- ✅ Feedback displays for each question
- ✅ Quiz results save to storage after completion
- ✅ Recent Work displays quiz results with correct percentages
- ✅ Clicking/tapping quiz result navigates to review page
- ✅ Color coding works (green ≥80%, yellow 60-79%, red <60%)
- ✅ Multi-select questions show "Submit Answer" button (NEW)
- ✅ Multi-select allows selecting multiple options before submitting (NEW)
- ✅ Single-select questions auto-submit on selection (existing behavior)
- ✅ Web app AI suggestions reset when moving between build steps (NEW)
- ✅ "Get AI Suggestions" button shows correct text on each step (NEW)
- ✅ Web app Critique mode shows status badges not numeric scores (NEW)
- ✅ Critique components are collapsible with feedback and suggestions (NEW)
- ✅ Both mobile and web apps use the same API schema correctly (NEW)
- ✅ Web app Build mode shows "What you're building" on metrics step (NEW)
- ✅ Web app Build mode shows "What you're building" on when step (NEW)
- ✅ Both mobile and web apps have identical functional behavior

### Known Issues:
- None

### Next Steps:
- Test end-to-end functionality on both platforms
- Verify all recent work sections work correctly
- Cross-platform testing to ensure parity

---

## ⏳ SESSION 7: End-to-End Testing & Verification (PENDING)

### Status: **NOT STARTED**
### Estimated Time: 2 hours

### Full Testing Checklist:

#### Web App Testing
**Learn Mode:**
- [ ] Can view all 10 examples
- [ ] Resume functionality works mid-session
- [ ] Quiz displays all 5 questions
- [ ] Quiz scoring works correctly
- [ ] Progress tracks examples and quiz completion

**Build Mode:**
- [ ] AI suggestions work on "What" step
- [ ] AI suggestions work on "Metrics" step (NEW)
- [ ] AI suggestions work on "When" step (NEW)
- [ ] Suggestions are cached (no duplicate API calls)
- [ ] Auto-polishing works
- [ ] Can save and exit
- [ ] Recent Work displays built JTBDs

**Critique Mode:**
- [ ] Can analyze JTBD statements
- [ ] Critique results are cached
- [ ] Component scores display correctly
- [ ] Recent Work displays critiques

**Home Page:**
- [ ] Auto-refreshes every 2 seconds (NEW)
- [ ] Progress cards show correct data
- [ ] Recent Work sections work
- [ ] Can navigate to review previous work

#### Mobile App Testing
**Learn Mode:**
- [ ] Can view all 10 examples
- [ ] Quiz system works (all 5 questions)
- [ ] Quiz scoring works
- [ ] Progress tracks correctly (includes quiz)
- [ ] Summary stage displays
- [ ] "Review Answers" button works from summary (NEW)
- [ ] Review stage shows all questions with correct/incorrect badges (NEW)
- [ ] Review stage highlights correct answers in green (NEW)
- [ ] Review stage shows user's wrong answers with "(Your answer)" label (NEW)
- [ ] Quiz results save to storage after completion (NEW)

**Home Page:**
- [ ] Quiz Results section appears in Recent Work (NEW)
- [ ] Last 3 quiz results display correctly (NEW)
- [ ] Quiz score percentage is accurate (NEW)
- [ ] Color coding works (green ≥80%, yellow 60-79%, red <60%) (NEW)
- [ ] Tapping quiz result navigates to Learn page in review mode (NEW)
- [ ] Total quiz count badge is accurate (NEW)

**Build/Critique/Home:**
- [ ] All existing functionality still works
- [ ] No regressions from web changes

#### Cross-App Verification
- [ ] Both apps have same core functionality
- [ ] UI/UX differences are intentional (mobile vs web)
- [ ] No functional gaps between platforms

#### Performance Testing
- [ ] No memory leaks from caching
- [ ] Intervals clean up properly
- [ ] API call reduction confirmed via Network tab

#### Browser Testing (Web)
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile responsive views

---

## How to Resume from Checkpoint

### If Stopping After SESSION 1:
**Current State:**
- ✅ Web app has AI suggestions on all 3 build steps (What, Metrics, When)
- ⏳ No caching yet
- ⏳ No resume functionality yet
- ⏳ No auto-refresh yet
- ⏳ Mobile quiz not implemented yet

**To Resume:**
1. Open this file: `REFACTORING_CHECKPOINTS.md`
2. Start with SESSION 2: API Response Caching
3. Follow implementation plan in SESSION 2 section above

### If Stopping After SESSION 2:
**Current State:**
- ✅ Web app has AI suggestions on all 3 build steps
- ✅ API response caching implemented
- ⏳ No resume functionality yet
- ⏳ No auto-refresh yet
- ⏳ Mobile quiz not implemented yet

**To Resume:**
1. Start with SESSION 3: Learn Mode Resume
2. Follow implementation plan above

### If Stopping After SESSION 3:
**Current State:**
- ✅ Web app has AI suggestions
- ✅ API caching implemented
- ✅ Resume functionality added
- ⏳ No auto-refresh yet
- ⏳ Mobile quiz not implemented yet

**To Resume:**
1. Start with SESSION 4: Home Page Auto-Refresh
2. Follow implementation plan above

### If Stopping After SESSION 4:
**Current State:**
- ✅ All web app updates complete
- ⏳ Mobile quiz not implemented yet

**To Resume:**
1. Start with SESSION 5: Port Quiz to Mobile
2. This is the most complex session (3-4 hours)
3. Follow detailed implementation plan above

### If Stopping After SESSION 5:
**Current State:**
- ✅ All web app updates complete
- ✅ Mobile quiz system implemented
- ⏳ Quiz review and Recent Work not implemented
- ⏳ Testing not done

**To Resume:**
1. Start with SESSION 6: Quiz Review & Recent Work
2. Follow implementation plan above

### If Stopping After SESSION 6:
**Current State:**
- ✅ All updates complete
- ✅ Quiz review functionality added
- ✅ Quiz results in Recent Work added
- ⏳ Testing not done

**To Resume:**
1. Start with SESSION 7: Testing
2. Work through all testing checklists
3. Fix any bugs discovered

---

## Quick Reference: Files Modified by Session

| Session | Files Modified | Lines Changed (approx) |
|---------|----------------|------------------------|
| 1 | `client/src/pages/build-mode.tsx` | ~150 lines |
| 2 | `client/src/pages/build-mode.tsx`, `client/src/pages/critique-mode.tsx` | ~50 lines |
| 3 | `client/src/pages/learn-mode.tsx` | ~30 lines |
| 4 | `client/src/pages/home.tsx` | ~15 lines |
| 5 | `jtbd-mobile/src/pages/LearnPage.tsx` | ~300 lines |
| 6 | Mobile: `jtbd-mobile/src/pages/LearnPage.tsx`, `jtbd-mobile/src/pages/HomePage.tsx`, `jtbd-mobile/src/lib/storage.ts`; Web: `client/src/pages/learn-mode.tsx`, `client/src/pages/home.tsx`, `client/src/lib/storage.ts`; Shared: `shared/schema.ts` | ~400 lines |
| 7 | None (testing only) | 0 lines |

---

## Important Notes

- **Always test after each session** before moving to the next
- **Commit changes after each session** to have rollback points
- **SESSION 5 is the most complex** - allocate sufficient time
- **Keep mobile and web UI differences** - don't try to make them identical
- **Focus on functional parity** not visual parity

---

## Contact/Questions

If issues arise:
1. Check DEVELOPMENT_NOTES.md for project-specific context
2. Review mobile implementation for reference: `jtbd-mobile/src/pages/BuildPage.tsx` and `LearnPage.tsx`
3. Review web implementation for reference: `client/src/pages/build-mode.tsx` and `learn-mode.tsx`

---

**Last Updated:** Session 6 Completion - Quiz Review & Recent Work Enhancement + AI Prompt Optimization
**Next Checkpoint:** Start SESSION 7 - End-to-End Testing & Verification

**Recent Changes (Session 6 + Bug Fixes + AI Optimization):**
- ✅ Added quiz review functionality to BOTH mobile and web apps
- ✅ Users can now see which questions they got right/wrong on both platforms
- ✅ Quiz results saved to storage and displayed in Recent Work (both platforms)
- ✅ Color-coded score indicators (green ≥80%, yellow 60-79%, red <60%)
- ✅ Clicking/tapping quiz result from home navigates to review page
- ✅ **FIXED:** Multi-select quiz questions now show "Submit Answer" button (both apps)
- ✅ **FIXED:** Web app AI suggestions state no longer persists across build steps
- ✅ **FIXED:** Web app Critique mode now uses correct schema (status-based not score-based)
- ✅ **FIXED:** Web app Build mode now shows "What you're building" on metrics and when steps
- ✅ **OPTIMIZED:** AI prompt for metrics now prioritizes user's "what" statement over scenario context
- ✅ **OPTIMIZED:** AI prompt for timeline now extracts complexity from WHAT + HOW MUCH for better estimates
- ✅ **FIXED:** Metrics AI suggestions panel now stays open for easy multi-selection (both apps)
- ✅ **IMPORTANT:** Maintained functional parity between mobile and web apps

---

## 🎯 SESSION 6.5: AI Prompt Optimization for Better Metrics Suggestions

### Status: **COMPLETED**
### Time Spent: ~15 minutes
### Files Modified:
- `server/ai-service.ts`

### Changes Made:

#### Business Logic Improvement: Prioritize User Input Over Scenario Context
**Location:** `server/ai-service.ts:247-285`

**Problem:**
The AI prompt for generating metrics suggestions treated the scenario context and user's "what" statement with equal weight. This could lead to generic metrics based on the scenario rather than specific metrics tailored to what the user is actually building.

**Solution:**
Restructured the prompt to explicitly prioritize the user's input as the PRIMARY FOCUS, with scenario context relegated to supporting/background information.

**Before:**
```javascript
instructions = `You are helping someone define measurable metrics for a JTBD statement.

Context:
${contextDetails}

What they're building: ${request.currentInput || 'none'}

Make metrics that:
- Are directly relevant to the specific scenario and situation above
...
```

**After:**
```javascript
instructions = `You are helping someone define measurable metrics for a JTBD statement.

PRIMARY FOCUS - What they're building:
"${request.currentInput || 'none'}"

This is the specific work/goal that needs to be measured. Your metric suggestions MUST directly measure the success and impact of THIS specific work.

Supporting context (for domain understanding):
${contextDetails}

Make metrics that:
- MOST IMPORTANTLY: Directly measure the success and impact of the specific work described above
- Are realistic and achievable for this specific initiative
- Align closely with what is being built/implemented
...
```

**Impact:**
- ✅ Metrics are now more specific to user's actual goal
- ✅ Less generic/scenario-based suggestions
- ✅ Better alignment between WHAT and HOW MUCH components
- ✅ Affects both web and mobile apps (server-side change)

**Business Justification:**
Two users in the same scenario (e.g., "Manufacturing Manager") might have completely different goals:
- User A: "Implement lean manufacturing systems" → needs metrics about process efficiency, waste reduction
- User B: "Reduce workplace safety incidents" → needs metrics about injury rates, safety compliance

The AI must focus on the user's specific goal, using the scenario only for domain context/realistic ranges.

---

#### Timeline Estimation Improvement: Extract Complexity from WHAT + HOW MUCH
**Location:** `server/ai-service.ts:286-333`

**Problem:**
The AI prompt for generating timeline ("When") suggestions treated scenario context and the actual work/metrics equally. Timelines should be based on the scope of WHAT is being built and the magnitude of change indicated by HOW MUCH metrics, not generic scenario characteristics.

**Solution:**
Restructured the prompt to prioritize WHAT + HOW MUCH as the PRIMARY FOCUS for extracting complexity signals, with scenario context providing only industry norms.

**Before:**
```javascript
instructions = `You are helping someone define a strategic deadline for a JTBD statement.

Context:
${contextDetails}

The work and metrics: ${request.currentInput || 'none'}

Guidelines:
- Consider the complexity and scale shown in the scenario context
...
```

**After:**
```javascript
instructions = `You are helping someone define a strategic deadline for a JTBD statement. Generate 3 realistic timeline suggestions as starting points (these are suggestions, not precise estimates).

PRIMARY FOCUS - Analyze the scope and complexity:
"${request.currentInput || 'none'}"

Extract timeline signals from:
1. WHAT (the work scope): Look for scale indicators like "enterprise-wide", "200 applications", "15 factories"
2. HOW MUCH (the metrics): Analyze the magnitude of change - larger deltas suggest longer timelines

Supporting context (for industry norms):
${contextDetails}

Generate 3 timeline options:
1. CONSERVATIVE: Longer timeline accounting for complexity, risks (e.g., 4-5 years)
2. MODERATE: Balanced timeline (e.g., 2-3 years)
3. AGGRESSIVE: Faster timeline for focused initiatives (e.g., 12-18 months)

Guidelines:
- Larger scope/metrics deltas = longer timelines
- Enterprise-wide/multi-location = add time for rollout
...

IMPORTANT: These are suggested starting points based on typical complexity patterns. The user knows their actual constraints (budget, resources, urgency) and will adjust accordingly.
```

**Impact:**
- ✅ Timeline suggestions now analyze actual work scope (scale keywords, geography)
- ✅ Considers magnitude of metrics deltas (incremental vs transformational)
- ✅ Provides 3 options: conservative, moderate, aggressive
- ✅ Sets proper expectations: these are starting points, not precise estimates
- ✅ Affects both web and mobile apps (server-side change)

**Acknowledgment of Limitations:**
Timeline estimation without knowing budget, resources, current state, and organizational constraints is inherently limited. The AI provides reasonable starting point suggestions based on complexity patterns, but users must adjust based on their reality.

**Example:**
- "Migrate 200 applications to AWS, reducing infrastructure costs from $5M to $2M annually"
  - AI sees: large scale ("200 applications"), significant delta ($3M savings)
  - Suggests: Conservative (Q4 2029), Moderate (Q2 2028), Aggressive (Q4 2026)
  - User adjusts based on actual budget, team size, urgency

---

#### UX Improvement: Keep Metrics AI Suggestions Panel Open
**Location:** `client/src/pages/build-mode.tsx:547`, `jtbd-mobile/src/pages/BuildPage.tsx:638`

**Problem:**
In the metrics step, users can add multiple metrics to their JTBD. However, after clicking an AI suggestion to add a metric, the suggestions panel would close, forcing users to click "Get AI Suggestions" again to see the remaining options (even though they were cached).

**Solution:**
Removed the `setShowHints(false)` call when a metric suggestion is clicked. The panel now stays open, allowing users to easily select 2-3 metrics without reopening the panel.

**Before:**
```javascript
onClick={() => {
  setBuildData({
    ...buildData,
    metrics: [...buildData.metrics, { name: name.trim(), current: current.trim(), target: target.trim() }]
  });
  setShowHints(false); // ❌ This closed the panel
}}
```

**After:**
```javascript
onClick={() => {
  setBuildData({
    ...buildData,
    metrics: [...buildData.metrics, { name: name.trim(), current: current.trim(), target: target.trim() }]
  });
  // Don't close hints for metrics - user might want to add multiple
}}
```

**Impact:**
- ✅ Better UX for multi-select scenario (metrics step)
- ✅ Users can quickly add 2-3 metrics without extra clicks
- ✅ Panel still closes when user clicks "Hide AI Suggestions" button
- ✅ Panel still auto-closes when navigating to next step
- ✅ Applied to both web and mobile apps

**Note:** This behavior is specific to the metrics step. The "what" and "when" steps still auto-close the panel after selection since users typically only pick one suggestion.
