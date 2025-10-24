export type SignLanguage = 'ASL' | 'BSL';

export type SignDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface SignEntry {
  phrase: string;
  description: string;
  difficulty: SignDifficulty;
}

export type SignDictionary = Record<SignLanguage, SignEntry[]>;
