import type { SignDictionary, SignLanguage } from '../types';

export const signTranslations: SignDictionary = {
  ASL: [
    {
      phrase: 'Hello',
      description: 'Right hand raised, palm forward, move side-to-side as a casual greeting.',
      difficulty: 'beginner'
    },
    {
      phrase: 'Thank you',
      description: 'Fingertips at chin, move hand forward in the direction of the person you are thanking.',
      difficulty: 'beginner'
    },
    {
      phrase: 'Practice makes perfect',
      description: 'Dominant hand rubs knuckles of non-dominant fist, then both thumbs up, circling to show improvement.',
      difficulty: 'intermediate'
    }
  ],
  BSL: [
    {
      phrase: 'Hello',
      description: 'Flat dominant hand taps against temple in a small motion, smiling.',
      difficulty: 'beginner'
    },
    {
      phrase: 'Thank you',
      description: 'Flat dominant hand touches chin then moves forward away from the face.',
      difficulty: 'beginner'
    },
    {
      phrase: 'How are you?',
      description: 'Both hands open, palms in, move forward slightly with questioning facial expression.',
      difficulty: 'intermediate'
    }
  ]
};

const isSignLanguage = (value: string | undefined): value is SignLanguage => value === 'ASL' || value === 'BSL';

const envDefault = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_DEFAULT_LANGUAGE;

export const DEFAULT_LANGUAGE: SignLanguage = isSignLanguage(envDefault) && signTranslations[envDefault]
  ? envDefault
  : 'ASL';
