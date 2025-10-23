import { z } from "zod";

// JTBD Example Card for Learn Mode
export const jtbdExampleSchema = z.object({
  id: z.number(),
  role: z.string(),
  context: z.object({
    title: z.string(),
    company: z.string(),
    challenge: z.string(),
    priority: z.string(),
  }),
  badJtbd: z.object({
    statement: z.string(),
    whyBad: z.array(z.string()),
  }),
  goodJtbd: z.object({
    statement: z.string(),
    whyGood: z.array(z.string()),
  }),
});

export type JTBDExample = z.infer<typeof jtbdExampleSchema>;

// Quiz Question for Learn Mode
export const quizQuestionSchema = z.object({
  id: z.number(),
  type: z.enum(['spot-flaw', 'choose-better', 'missing-component', 'google-test', 'identify-good']),
  question: z.string(),
  options: z.array(z.object({
    id: z.string(),
    text: z.string(),
    correct: z.boolean(),
  })),
  feedback: z.string(),
  multiSelect: z.boolean().optional(),
});

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

// Build Mode Scenario
export const buildScenarioSchema = z.object({
  id: z.string(),
  role: z.string(),
  industry: z.string(),
  challenge: z.string(),
  difficulty: z.number(),
  context: z.object({
    company: z.string(),
    size: z.string(),
    situation: z.array(z.string()),
    valueAgenda: z.string(),
  }),
  hints: z.object({
    what: z.array(z.string()),
    howMuch: z.array(z.string()),
    when: z.string(),
  }),
});

export type BuildScenario = z.infer<typeof buildScenarioSchema>;

// User's Built JTBD
export const builtJtbdSchema = z.object({
  scenarioId: z.string(),
  what: z.string(),
  metrics: z.array(z.object({
    name: z.string(),
    current: z.string(),
    target: z.string(),
  })),
  when: z.string(),
  assembled: z.string(),
  score: z.number().optional(),
  feedback: z.string().optional(),
});

export type BuiltJTBD = z.infer<typeof builtJtbdSchema>;

// Critique Request/Response
export const critiqueRequestSchema = z.object({
  jtbdStatement: z.string(),
});

export const critiqueResponseSchema = z.object({
  overallScore: z.number(),
  whatScore: z.number(),
  howMuchScore: z.number(),
  whenScore: z.number(),
  whatFeedback: z.string(),
  howMuchFeedback: z.string(),
  whenFeedback: z.string(),
  suggestions: z.array(z.string()),
  improvedVersion: z.string().optional(),
});

export type CritiqueRequest = z.infer<typeof critiqueRequestSchema>;
export type CritiqueResponse = z.infer<typeof critiqueResponseSchema>;

// AI Suggestion Request/Response (for Build mode)
export const suggestionRequestSchema = z.object({
  scenarioId: z.string(),
  step: z.enum(['what', 'metrics', 'when']),
  currentInput: z.string().optional(),
});

export const suggestionResponseSchema = z.object({
  suggestions: z.array(z.string()),
});

export type SuggestionRequest = z.infer<typeof suggestionRequestSchema>;
export type SuggestionResponse = z.infer<typeof suggestionResponseSchema>;

// Progress Tracking
export const userProgressSchema = z.object({
  learnMode: z.object({
    completed: z.boolean(),
    examplesViewed: z.number(),
    quizScore: z.number().optional(),
  }),
  buildMode: z.object({
    completed: z.boolean(),
    jtbdsCreated: z.number(),
    bestScore: z.number().optional(),
  }),
  critiqueMode: z.object({
    completed: z.boolean(),
    jtbdsCritiqued: z.number(),
  }),
});

export type UserProgress = z.infer<typeof userProgressSchema>;
