import { QuizQuestion } from "../shared/schema";

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    type: 'spot-flaw',
    question: "What's wrong with this JTBD?\n\n\"Improve sales performance and grow revenue in key markets\"",
    options: [
      { id: 'a', text: 'Timeline is missing', correct: false },
      { id: 'b', text: 'Not specific about WHICH markets', correct: false },
      { id: 'c', text: 'No metrics (how much growth?)', correct: false },
      { id: 'd', text: 'All of the above', correct: true },
    ],
    feedback: "Correct! This JTBD has multiple problems. It's too vague, has no metrics, and could apply to any sales role.",
  },
  {
    id: 2,
    type: 'choose-better',
    question: "Which JTBD is more bespoke?",
    options: [
      { id: 'a', text: 'Transform operations to reduce costs by 20%', correct: false },
      { id: 'b', text: 'Consolidate 12 distribution centers into 4 regional hubs, implement automated inventory management, reducing logistics costs from $89M to $71M (20%) by Q2 2026', correct: true },
    ],
    feedback: "Option B wins! It specifies the actual work (consolidation, automation) and gives precise metrics with context.",
  },
  {
    id: 3,
    type: 'missing-component',
    question: "What's missing from this JTBD?\n\n\"Build enterprise sales team of 25 reps and establish Fortune 500 sales playbook, growing enterprise ARR from $12M to $45M\"",
    options: [
      { id: 'a', text: 'WHAT is missing', correct: false },
      { id: 'b', text: 'HOW MUCH is missing', correct: false },
      { id: 'c', text: 'WHEN is missing', correct: true },
      { id: 'd', text: 'Nothing is missing', correct: false },
    ],
    feedback: "No deadline! We don't know if this should happen in 6 months or 3 years. Always include WHEN.",
  },
  {
    id: 4,
    type: 'google-test',
    question: "Can you Google this job description?\n\n\"Lead marketing strategy and brand development initiatives\"",
    options: [
      { id: 'a', text: 'Yes - it\'s too generic', correct: true },
      { id: 'b', text: 'No - it\'s specific enough', correct: false },
    ],
    feedback: "This would return thousands of similar job postings. Not bespoke enough!",
  },
  {
    id: 5,
    type: 'identify-good',
    question: "What makes this JTBD strong?\n\n\"Redesign customer onboarding process using AI-powered workflows, reducing time-to-value from 45 days to 12 days and increasing activation rate from 52% to 82% by Q3 2026\"\n\nSelect all that apply:",
    options: [
      { id: 'a', text: 'Specific work described (redesign + AI workflows)', correct: true },
      { id: 'b', text: 'Clear metrics with before/after (45→12 days, 52%→82%)', correct: true },
      { id: 'c', text: 'Deadline included (Q3 2026)', correct: true },
      { id: 'd', text: 'Bespoke to this situation', correct: true },
    ],
    feedback: "All of them! This is an excellent JTBD.",
    multiSelect: true,
  },
];
