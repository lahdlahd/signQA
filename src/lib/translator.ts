import { signTranslations } from '../data/signTranslations';
import type { SignEntry, SignLanguage, SignDifficulty } from '../types';

const DIFFICULTY_PRIORITY: Record<SignDifficulty, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2
};

export class SignTranslationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SignTranslationError';
  }
}

const sanitize = (value: string) => value.trim().toLowerCase();

export function getSupportedLanguages(): SignLanguage[] {
  return Object.keys(signTranslations) as SignLanguage[];
}

export function getPhrasesForLanguage(language: SignLanguage): SignEntry[] {
  const entries = signTranslations[language];

  if (!entries) {
    throw new SignTranslationError(`Unsupported language: ${language}`);
  }

  return [...entries].sort((a, b) => {
    const byDifficulty = DIFFICULTY_PRIORITY[a.difficulty] - DIFFICULTY_PRIORITY[b.difficulty];

    if (byDifficulty !== 0) {
      return byDifficulty;
    }

    return a.phrase.localeCompare(b.phrase);
  });
}

export function translateSign(language: SignLanguage, phrase: string): SignEntry {
  const entries = signTranslations[language];

  if (!entries) {
    throw new SignTranslationError(`Unsupported language: ${language}`);
  }

  if (!phrase.trim()) {
    throw new SignTranslationError('Please choose a phrase to translate.');
  }

  const normalizedPhrase = sanitize(phrase);

  const match = entries.find(entry => sanitize(entry.phrase) === normalizedPhrase);

  if (!match) {
    throw new SignTranslationError(`The phrase "${phrase}" is not defined for ${language}.`);
  }

  return match;
}

export function describeTranslation(language: SignLanguage, phrase: string): string {
  const translation = translateSign(language, phrase);
  return `${translation.phrase} (${language}) — ${translation.description}`;
}
