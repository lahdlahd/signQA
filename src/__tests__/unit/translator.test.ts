import { describe, expect, it } from 'vitest';
import { DEFAULT_LANGUAGE, signTranslations } from '../../data/signTranslations';
import { getPhrasesForLanguage, getSupportedLanguages, translateSign, SignTranslationError } from '../../lib/translator';

describe('translator', () => {
  it('falls back to ASL when no environment override is provided', () => {
    expect(DEFAULT_LANGUAGE).toBe('ASL');
  });

  it('returns supported languages from the dictionary', () => {
    const languages = getSupportedLanguages();
    expect(languages).toContain(DEFAULT_LANGUAGE);
    expect(languages).toEqual(Object.keys(signTranslations));
  });

  it('sorts phrases by difficulty then alphabetically', () => {
    const phrases = getPhrasesForLanguage('ASL');
    const difficulties = phrases.map(item => item.difficulty);

    expect(phrases[0].difficulty).toBe('beginner');
    expect(difficulties).toEqual(['beginner', 'beginner', 'intermediate']);
    expect(phrases[0].phrase.localeCompare(phrases[1].phrase)).toBeLessThanOrEqual(0);
  });

  it('translates a known phrase', () => {
    const translation = translateSign('BSL', 'Hello');

    expect(translation.description).toContain('taps against temple');
  });

  it('throws if phrase is missing', () => {
    expect(() => translateSign('ASL', 'Non-existent phrase')).toThrow(SignTranslationError);
  });

  it('matches phrases regardless of casing or surrounding whitespace', () => {
    const translation = translateSign('ASL', '  hello  ');
    expect(translation.phrase).toBe('Hello');
  });
});
