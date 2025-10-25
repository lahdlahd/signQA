import { FormEvent, useEffect, useMemo, useState } from 'react';
import './App.css';
import { DEFAULT_LANGUAGE } from './data/signTranslations';
import { getPhrasesForLanguage, getSupportedLanguages, translateSign } from './lib/translator';
import type { SignEntry, SignLanguage } from './types';

const languages = getSupportedLanguages();

const difficultyStyles: Record<SignEntry['difficulty'], string> = {
  beginner: 'tag tag--beginner',
  intermediate: 'tag tag--intermediate',
  advanced: 'tag tag--advanced'
};

function App() {
  const [language, setLanguage] = useState<SignLanguage>(DEFAULT_LANGUAGE);
  const [phrase, setPhrase] = useState('');
  const [result, setResult] = useState<SignEntry | null>(null);
  const [error, setError] = useState('');

  const phrases = useMemo(() => getPhrasesForLanguage(language), [language]);

  useEffect(() => {
    if (phrases.length > 0) {
      setPhrase(phrases[0].phrase);
    } else {
      setPhrase('');
    }
    setResult(null);
    setError('');
  }, [language, phrases]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const translation = translateSign(language, phrase);
      setResult(translation);
      setError('');
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Unable to translate phrase.');
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <h1>signQA</h1>
        <p>Interactive practice for core sign language phrases.</p>
      </header>

      <main>
        <section className="card" aria-labelledby="translator-heading">
          <div className="card__content">
            <h2 id="translator-heading">Translate a sign</h2>
            <p className="muted">Choose a language and phrase to get a quick reminder of the hand shapes and movement.</p>

            <form className="form" onSubmit={handleSubmit}>
              <label className="form__label" htmlFor="language-select">
                Sign language
              </label>
              <select
                id="language-select"
                className="form__control"
                value={language}
                onChange={event => setLanguage(event.target.value as SignLanguage)}
              >
                {languages.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <label className="form__label" htmlFor="phrase-select">
                Phrase
              </label>
              <select
                id="phrase-select"
                className="form__control"
                value={phrase}
                onChange={event => setPhrase(event.target.value)}
              >
                {phrases.map(item => (
                  <option key={item.phrase} value={item.phrase}>
                    {item.phrase}
                  </option>
                ))}
              </select>

              <button className="button" type="submit">
                Show translation
              </button>
            </form>

            {error && (
              <p role="alert" className="alert">
                {error}
              </p>
            )}

            {result && (
              <article aria-live="polite" className="translation" data-testid="translation-result">
                <h3>{result.phrase}</h3>
                <p>{result.description}</p>
                <span className={difficultyStyles[result.difficulty]}>{result.difficulty}</span>
              </article>
            )}
          </div>
        </section>

        <section className="card" aria-labelledby="practice-heading">
          <div className="card__content">
            <h2 id="practice-heading">Practice tips</h2>
            <ul className="tips">
              <li>Mirror your movements to self-correct accuracy.</li>
              <li>Use facial expressions to match the tone of the phrase.</li>
              <li>Repeat new phrases three times across the day for long-term memory.</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="footer">
        <small>Built for accessible sign language practice.</small>
      </footer>
    </div>
  );
}

export default App;
