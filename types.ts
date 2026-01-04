
export enum SkillLevel {
  BEGINNER = 'Beginner (Basic stitches & shaping)',
  INTERMEDIATE = 'Intermediate (Color changes & sewing)',
  EXPERT = 'Expert (Complex wiring & embroidery)'
}

export enum BuildPreference {
  LOW_SEW = 'Low-Sew (Join limbs as you go)',
  STANDARD = 'Standard Assembly (Sew parts together)'
}

export enum DollSize {
  MINI = 'Mini (< 4 inches)',
  STANDARD = 'Standard (8-10 inches)',
  JUMBO = 'Jumbo (12+ inches)'
}

export interface UserPreferences {
  skillLevel: SkillLevel;
  buildPreference: BuildPreference;
  dollSize: DollSize;
}

export type AppStep = 'welcome' | 'upload' | 'generating_plushie' | 'preview_plushie' | 'questions' | 'generating_pattern' | 'result';

export interface AppState {
  step: AppStep;
  originalImage: string | null;
  generatedPlushieUrl: string | null;
  preferences: UserPreferences | null;
  finalPattern: string | null;
  error: string | null;
}
