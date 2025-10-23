import { UserProgress, BuiltJTBD } from "@shared/schema";

const PROGRESS_KEY = 'jtbd-progress';
const BUILT_JTBDS_KEY = 'jtbd-built';
const CRITIQUES_KEY = 'jtbd-critiques';

export function getProgress(): UserProgress {
  try {
    const saved = localStorage.getItem(PROGRESS_KEY);
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

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

export function updateLearnProgress(examplesViewed: number, quizScore?: number): void {
  const progress = getProgress();
  progress.learnMode.examplesViewed = examplesViewed;
  if (quizScore !== undefined) {
    progress.learnMode.quizScore = quizScore;
    progress.learnMode.completed = true;
  }
  saveProgress(progress);
}

export function updateBuildProgress(jtbd: BuiltJTBD): void {
  const progress = getProgress();
  progress.buildMode.jtbdsCreated += 1;
  progress.buildMode.completed = true;
  
  if (jtbd.score && (!progress.buildMode.bestScore || jtbd.score > progress.buildMode.bestScore)) {
    progress.buildMode.bestScore = jtbd.score;
  }
  
  saveProgress(progress);
  
  // Save the built JTBD
  try {
    const saved = localStorage.getItem(BUILT_JTBDS_KEY);
    const jtbds: BuiltJTBD[] = saved ? JSON.parse(saved) : [];
    jtbds.push({ ...jtbd, assembled: jtbd.assembled });
    localStorage.setItem(BUILT_JTBDS_KEY, JSON.stringify(jtbds));
  } catch (e) {
    console.error('Failed to save built JTBD:', e);
  }
}

export function updateCritiqueProgress(): void {
  const progress = getProgress();
  progress.critiqueMode.jtbdsCritiqued += 1;
  progress.critiqueMode.completed = true;
  saveProgress(progress);
}

export function getBuiltJTBDs(): BuiltJTBD[] {
  try {
    const saved = localStorage.getItem(BUILT_JTBDS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load built JTBDs:', e);
    return [];
  }
}
