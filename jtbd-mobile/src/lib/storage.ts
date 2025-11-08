import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, BuiltJTBD, QuizResult } from '../shared/schema';

const PROGRESS_KEY = 'jtbd-progress';
const BUILT_JTBDS_KEY = 'jtbd-built';
const CRITIQUES_KEY = 'jtbd-critiques';
const QUIZ_RESULTS_KEY = 'jtbd-quiz-results';

export async function getProgress(): Promise<UserProgress> {
  try {
    const saved = await AsyncStorage.getItem(PROGRESS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load progress:', e);
  }

  return {
    learnMode: { completed: false, examplesViewed: 0 },
    buildMode: { completed: false, jtbdsCreated: 0 },
    critiqueMode: { completed: false, jtbdsCritiqued: 0 },
  };
}

export async function saveProgress(progress: UserProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

export async function updateLearnProgress(examplesViewed: number, quizScore?: number): Promise<void> {
  const progress = await getProgress();
  progress.learnMode.examplesViewed = examplesViewed;
  if (quizScore !== undefined) {
    progress.learnMode.quizScore = quizScore;
    progress.learnMode.completed = true;
  }
  await saveProgress(progress);
}

export async function updateBuildProgress(jtbd: BuiltJTBD): Promise<void> {
  const progress = await getProgress();
  progress.buildMode.jtbdsCreated += 1;
  progress.buildMode.completed = progress.buildMode.jtbdsCreated >= 3;

  if (jtbd.score && (!progress.buildMode.bestScore || jtbd.score > progress.buildMode.bestScore)) {
    progress.buildMode.bestScore = jtbd.score;
  }

  await saveProgress(progress);

  // Save the built JTBD with timestamp
  try {
    const saved = await AsyncStorage.getItem(BUILT_JTBDS_KEY);
    const jtbds: BuiltJTBD[] = saved ? JSON.parse(saved) : [];
    jtbds.push({
      ...jtbd,
      assembled: jtbd.assembled,
      timestamp: new Date().toISOString()
    });
    await AsyncStorage.setItem(BUILT_JTBDS_KEY, JSON.stringify(jtbds));
  } catch (e) {
    console.error('Failed to save built JTBD:', e);
  }
}

export async function updateCritiqueProgress(jtbdStatement: string, critique: any): Promise<void> {
  const progress = await getProgress();
  progress.critiqueMode.jtbdsCritiqued += 1;
  progress.critiqueMode.completed = progress.critiqueMode.jtbdsCritiqued >= 5;
  await saveProgress(progress);

  // Save the critique with timestamp
  try {
    const saved = await AsyncStorage.getItem(CRITIQUES_KEY);
    const critiques: Array<{statement: string, critique: any, timestamp: string}> = saved ? JSON.parse(saved) : [];
    critiques.push({
      statement: jtbdStatement,
      critique,
      timestamp: new Date().toISOString()
    });
    await AsyncStorage.setItem(CRITIQUES_KEY, JSON.stringify(critiques));
  } catch (e) {
    console.error('Failed to save critique:', e);
  }
}

export async function getBuiltJTBDs(): Promise<BuiltJTBD[]> {
  try {
    const saved = await AsyncStorage.getItem(BUILT_JTBDS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load built JTBDs:', e);
    return [];
  }
}

export async function getCritiques(): Promise<Array<{statement: string, critique: any, timestamp: string}>> {
  try {
    const saved = await AsyncStorage.getItem(CRITIQUES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load critiques:', e);
    return [];
  }
}

export async function saveQuizResult(score: number, totalQuestions: number, answers: Record<number, string[]>): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(QUIZ_RESULTS_KEY);
    const results: QuizResult[] = saved ? JSON.parse(saved) : [];

    results.push({
      score,
      totalQuestions,
      answers,
      timestamp: new Date().toISOString()
    });

    await AsyncStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(results));
  } catch (e) {
    console.error('Failed to save quiz result:', e);
  }
}

export async function getQuizResults(): Promise<QuizResult[]> {
  try {
    const saved = await AsyncStorage.getItem(QUIZ_RESULTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load quiz results:', e);
    return [];
  }
}
