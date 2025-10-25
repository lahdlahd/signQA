import { Fragment, FormEvent, useEffect, useMemo, useState } from 'react';
import './App.css';
import { allAuthors, allTags, allTopics } from './data/questions';
import { searchQuestions, suggestQuestions } from './lib/search';
import type { HighlightPart, SearchHit, SearchResponse } from './types';

const PAGE_SIZE = 5;

interface InitialState {
  query: string;
  topics: string[];
  tags: string[];
  author: string;
  page: number;
}

const getInitialState = (): InitialState => {
  if (typeof window === 'undefined') {
    return { query: '', topics: [], tags: [], author: '', page: 1 };
  }

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') ?? '';
  const topics = params.getAll('topic');
  const tags = params.getAll('tag');
  const author = params.get('author') ?? '';
  const pageParam = Number.parseInt(params.get('page') ?? '1', 10);
  const page = Number.isNaN(pageParam) ? 1 : pageParam;

  return { query, topics, tags, author, page };
};

const renderHighlightParts = (parts: HighlightPart[]) => (
  parts.map((part, index) =>
    part.isMatch ? (
      <mark key={`${part.text}-${index}`}>{part.text}</mark>
    ) : (
      <Fragment key={`${part.text}-${index}`}>{part.text}</Fragment>
    )
  )
);

const dateFormatter = new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' });

const formatDate = (value: string): string => {
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return dateFormatter.format(date);
  }
  return value;
};

function App() {
  const initial = useMemo(getInitialState, []);

  const [inputValue, setInputValue] = useState(initial.query);
  const [searchQuery, setSearchQuery] = useState(initial.query);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(() =>
    initial.topics.filter(topic => allTopics.includes(topic))
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(() =>
    initial.tags.filter(tag => allTags.includes(tag))
  );
  const [selectedAuthor, setSelectedAuthor] = useState(() =>
    initial.author && allAuthors.includes(initial.author) ? initial.author : ''
  );
  const [page, setPage] = useState(() => Math.max(1, initial.page));
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const hasActiveFilters = selectedTopics.length > 0 || selectedTags.length > 0 || Boolean(selectedAuthor);

  const topicSet = useMemo(() => new Set(selectedTopics), [selectedTopics]);
  const tagSet = useMemo(() => new Set(selectedTags), [selectedTags]);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const response = await searchQuestions({
          query: searchQuery,
          topics: selectedTopics,
          tags: selectedTags,
          author: selectedAuthor || undefined,
          page,
          pageSize: PAGE_SIZE
        });

        if (cancelled) {
          return;
        }

        setResults(response);

        if (response.page !== page) {
          setPage(response.page);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError('Unable to load search results right now. Please try again.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchQuery, selectedTopics, selectedTags, selectedAuthor, page]);

  useEffect(() => {
    const trimmed = inputValue.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      suggestQuestions(trimmed).then(items => {
        if (!cancelled) {
          setSuggestions(items);
        }
      });
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [inputValue]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams();
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery) {
      params.set('q', trimmedQuery);
    }

    selectedTopics.forEach(topic => params.append('topic', topic));
    selectedTags.forEach(tag => params.append('tag', tag));

    if (selectedAuthor) {
      params.set('author', selectedAuthor);
    }

    if (page > 1) {
      params.set('page', String(page));
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, selectedTopics, selectedTags, selectedAuthor, page]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const trimmed = searchQuery.trim();
    const title = trimmed ? `Search results for "${trimmed}" | signQA` : 'Search Q&A | signQA';
    const description = trimmed
      ? `Search results for "${trimmed}" across signQA practice tips, teaching advice, and community Q&A.`
      : 'Explore the signQA knowledge base with searchable questions and answers that cover practice techniques, teaching ideas, and community insights.';

    document.title = title;

    let descriptionMeta = document.querySelector('meta[name="description"]');
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.setAttribute('name', 'description');
      document.head.append(descriptionMeta);
    }
    descriptionMeta.setAttribute('content', description);

    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.append(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'index, follow');
  }, [searchQuery]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    setInputValue(trimmed);
    setSearchQuery(trimmed);
    setPage(1);
    setSuggestions([]);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setSearchQuery(value);
    setPage(1);
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => {
      const next = prev.includes(topic) ? prev.filter(item => item !== topic) : [...prev, topic];
      return next;
    });
    setPage(1);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = prev.includes(tag) ? prev.filter(item => item !== tag) : [...prev, tag];
      return next;
    });
    setPage(1);
  };

  const handleAuthorChange = (value: string) => {
    setSelectedAuthor(value);
    setPage(1);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setInputValue(suggestion);
    setSearchQuery(suggestion);
    setPage(1);
    setSuggestions([]);
  };

  const resetFilters = () => {
    setSelectedTopics([]);
    setSelectedTags([]);
    setSelectedAuthor('');
    setPage(1);
  };

  const goToPreviousPage = () => {
    setPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = (pageCount: number) => {
    setPage(prev => Math.min(pageCount, prev + 1));
  };

  const renderResult = (hit: SearchHit) => {
    const matchedTopicSet = new Set(hit.matchedTopics);
    const matchedTagSet = new Set(hit.matchedTags);

    return (
      <article key={hit.entry.id} className="result" data-testid="search-result">
        <h3 className="result__question">
          {renderHighlightParts(hit.questionHighlights)}
        </h3>
        <p className="result__snippet">
          {renderHighlightParts(hit.snippet)}
        </p>
        <div className="result__meta" aria-label="Result metadata">
          <span>{hit.entry.author}</span>
          <span>{formatDate(hit.entry.publishedAt)}</span>
        </div>
        <div className="result__chips" aria-label="Topics">
          {hit.entry.topics.map(topic => (
            <span key={topic} className={matchedTopicSet.has(topic) ? 'pill pill--match' : 'pill'}>
              {topic}
            </span>
          ))}
        </div>
        <div className="result__chips" aria-label="Tags">
          {hit.entry.tags.map(tag => (
            <span key={tag} className={matchedTagSet.has(tag) ? 'pill pill--match pill--quiet' : 'pill pill--quiet'}>
              {tag}
            </span>
          ))}
        </div>
      </article>
    );
  };

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__content">
          <h1>Search the signQA knowledge base</h1>
          <p>Find actionable answers across practice tips, community insights, and teaching strategies.</p>

          <form className="search-form" role="search" aria-label="Search knowledge base" onSubmit={handleSubmit}>
            <label className="search-form__label" htmlFor="search-input">
              Search the knowledge base
            </label>
            <div className="search-form__field">
              <input
                id="search-input"
                type="search"
                className="search-input"
                placeholder="Search by keywords, topic, tag, or author…"
                value={inputValue}
                onChange={event => handleInputChange(event.target.value)}
                autoComplete="off"
              />
              <button type="submit" className="search-button">
                Search
              </button>
            </div>
            {suggestions.length > 0 && (
              <ul className="autosuggest" role="listbox" aria-label="Search suggestions">
                {suggestions.map(suggestion => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      role="option"
                      className="autosuggest__item"
                      onMouseDown={event => event.preventDefault()}
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </form>
        </div>
      </header>

      <main className="layout" aria-labelledby="results-heading">
        <aside className="filters card" aria-label="Filter results">
          <div className="filters__header">
            <h2>Refine results</h2>
            {hasActiveFilters && (
              <button type="button" className="filters__reset" onClick={resetFilters}>
                Clear filters
              </button>
            )}
          </div>

          <fieldset className="filters__group">
            <legend className="filters__heading">Topics</legend>
            <ul className="filters__list">
              {allTopics.map(topic => (
                <li key={topic}>
                  <label className="filters__option">
                    <input
                      type="checkbox"
                      checked={topicSet.has(topic)}
                      onChange={() => toggleTopic(topic)}
                    />
                    <span>{topic}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <fieldset className="filters__group">
            <legend className="filters__heading">Tags</legend>
            <ul className="filters__list filters__list--compact">
              {allTags.map(tag => (
                <li key={tag}>
                  <label className="filters__option">
                    <input type="checkbox" checked={tagSet.has(tag)} onChange={() => toggleTag(tag)} />
                    <span>{tag}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <div className="filters__group">
            <label className="filters__heading" htmlFor="author-filter">
              Author
            </label>
            <select
              id="author-filter"
              className="filters__select"
              value={selectedAuthor}
              onChange={event => handleAuthorChange(event.target.value)}
            >
              <option value="">All authors</option>
              {allAuthors.map(author => (
                <option key={author} value={author}>
                  {author}
                </option>
              ))}
            </select>
          </div>
        </aside>

        <section className="results card" aria-live="polite">
          <div className="results__header">
            <h2 id="results-heading">Search results</h2>
            <p
              className="results__summary"
              role="status"
              aria-live="polite"
              data-testid="results-summary"
            >
              {isLoading
                ? 'Searching the knowledge base…'
                : `${results?.total ?? 0} ${results && results.total === 1 ? 'result' : 'results'}`}
            </p>
          </div>

          {error && (
            <p role="alert" className="alert">
              {error}
            </p>
          )}

          {!isLoading && results && results.items.length === 0 && !error && (
            <p className="status" data-testid="empty-state">
              No results matched your search. Try adjusting your keywords or removing a filter.
            </p>
          )}

          {results && results.items.length > 0 && (
            <div className="results__list">
              {results.items.map(renderResult)}
            </div>
          )}

          {isLoading && (
            <p className="status" data-testid="loading-state">
              Searching…
            </p>
          )}

          {results && results.pageCount > 1 && (
            <nav className="pagination" aria-label="Pagination">
              <button
                type="button"
                className="pagination__button"
                onClick={goToPreviousPage}
                disabled={results.page === 1}
              >
                Previous
              </button>
              <span className="pagination__status">
                Page {results.page} of {results.pageCount}
              </span>
              <button
                type="button"
                className="pagination__button"
                onClick={() => goToNextPage(results.pageCount)}
                disabled={results.page === results.pageCount}
              >
                Next
              </button>
            </nav>
          )}
        </section>
      </main>

      <footer className="footer">
        <small>signQA — Searchable practice knowledge for sign language learners, mentors, and teams.</small>
      </footer>
    </div>
  );
}

export default App;
