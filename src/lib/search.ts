import { knowledgeBase } from '../data/questions';
import type { HighlightPart, QAEntry, SearchParams, SearchResponse } from '../types';

interface IndexedEntry {
  entry: QAEntry;
  normalizedQuestion: string;
  normalizedAnswer: string;
  normalizedTopics: string[];
  normalizedTags: string[];
  normalizedAuthor: string;
  questionTrigrams: Set<string>;
  answerTrigrams: Set<string>;
}

interface SearchFiltersInternal {
  topics: Set<string>;
  tags: Set<string>;
  author: string;
}

interface RankedEntry {
  entry: QAEntry;
  indexed: IndexedEntry;
  score: number;
}

const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

const sanitize = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/[\s]+/g, ' ')
    .trim();

const dedupe = <T>(values: T[]): T[] => Array.from(new Set(values));

const createTrigramSetFromSanitized = (sanitized: string): Set<string> => {
  if (!sanitized) {
    return new Set();
  }

  const padded = `  ${sanitized}  `;
  if (padded.length <= 3) {
    return new Set([padded]);
  }

  const trigrams = new Set<string>();
  for (let i = 0; i <= padded.length - 3; i += 1) {
    trigrams.add(padded.slice(i, i + 3));
  }
  return trigrams;
};

const trigramSimilarity = (query: Set<string>, target: Set<string>): number => {
  if (query.size === 0 || target.size === 0) {
    return 0;
  }

  let matches = 0;
  for (const trigram of query) {
    if (target.has(trigram)) {
      matches += 1;
    }
  }

  return matches / Math.max(query.size, target.size);
};

const computeRecencyWeight = (entry: QAEntry): number => {
  const published = new Date(entry.publishedAt).getTime();

  if (Number.isNaN(published)) {
    return 0.15;
  }

  const daysSince = Math.max(0, (Date.now() - published) / MILLISECONDS_IN_DAY);
  const smoothingWindow = 120;
  return 1 / (1 + daysSince / smoothingWindow) + 0.15;
};

const indexedEntries: IndexedEntry[] = knowledgeBase.map(entry => {
  const normalizedQuestion = sanitize(entry.question);
  const normalizedAnswer = sanitize(entry.answer);
  const normalizedTopics = entry.topics.map(topic => sanitize(topic));
  const normalizedTags = entry.tags.map(tag => sanitize(tag));
  const normalizedAuthor = sanitize(entry.author);

  return {
    entry,
    normalizedQuestion,
    normalizedAnswer,
    normalizedTopics,
    normalizedTags,
    normalizedAuthor,
    questionTrigrams: createTrigramSetFromSanitized(normalizedQuestion),
    answerTrigrams: createTrigramSetFromSanitized(normalizedAnswer)
  };
});

const tokenize = (query: string): string[] => {
  const sanitized = sanitize(query);
  return sanitized ? sanitized.split(' ') : [];
};

const matchesFilters = (indexed: IndexedEntry, filters: SearchFiltersInternal): boolean => {
  const topicMatch = filters.topics.size === 0 || indexed.normalizedTopics.some(topic => filters.topics.has(topic));
  const tagMatch = filters.tags.size === 0 || indexed.normalizedTags.some(tag => filters.tags.has(tag));
  const authorMatch = !filters.author || indexed.normalizedAuthor === filters.author;
  return topicMatch && tagMatch && authorMatch;
};

const rankEntry = (
  indexed: IndexedEntry,
  tokens: string[],
  queryTrigrams: Set<string>,
  normalizedQuery: string,
  filters: SearchFiltersInternal
): number => {
  const questionSimilarity = normalizedQuery ? trigramSimilarity(queryTrigrams, indexed.questionTrigrams) : 0;
  const answerSimilarity = normalizedQuery ? trigramSimilarity(queryTrigrams, indexed.answerTrigrams) : 0;

  let tokenBoost = 0;
  for (const token of tokens) {
    if (indexed.normalizedQuestion.includes(token)) {
      tokenBoost += 1.25;
    }
    if (indexed.normalizedAnswer.includes(token)) {
      tokenBoost += 0.85;
    }
  }

  const topicTokenBoost = tokens.reduce((acc, token) => (
    indexed.normalizedTopics.some(topic => topic.includes(token)) ? acc + 0.5 : acc
  ), 0);

  const tagTokenBoost = tokens.reduce((acc, token) => (
    indexed.normalizedTags.some(tag => tag.includes(token)) ? acc + 0.45 : acc
  ), 0);

  const filterBoost =
    (filters.topics.size > 0 && indexed.normalizedTopics.some(topic => filters.topics.has(topic)) ? 0.6 : 0) +
    (filters.tags.size > 0 && indexed.normalizedTags.some(tag => filters.tags.has(tag)) ? 0.4 : 0) +
    (filters.author && indexed.normalizedAuthor === filters.author ? 0.8 : 0);

  const recencyBoost = computeRecencyWeight(indexed.entry);

  return questionSimilarity * 3.1 + answerSimilarity * 1.9 + tokenBoost + topicTokenBoost + tagTokenBoost + filterBoost + recencyBoost;
};

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createHighlightParts = (text: string, terms: string[]): HighlightPart[] => {
  if (!text) {
    return [{ text: '', isMatch: false }];
  }

  const cleaned = dedupe(terms.map(term => term.trim()).filter(Boolean));
  if (cleaned.length === 0) {
    return [{ text, isMatch: false }];
  }

  const pattern = cleaned.map(escapeRegExp).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts: HighlightPart[] = [];
  let lastIndex = 0;

  text.replace(regex, (match, _group, offset) => {
    if (offset > lastIndex) {
      parts.push({ text: text.slice(lastIndex, offset), isMatch: false });
    }
    parts.push({ text: match, isMatch: true });
    lastIndex = offset + match.length;
    return match;
  });

  if (parts.length === 0) {
    return [{ text, isMatch: false }];
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isMatch: false });
  }

  return parts;
};

const createSnippet = (text: string, normalizedTerms: string[], maxLength = 220): string => {
  if (!text) {
    return '';
  }

  if (normalizedTerms.length === 0) {
    return text.length > maxLength ? `${text.slice(0, maxLength)}${text.length > maxLength ? '…' : ''}` : text;
  }

  const lower = text.toLowerCase();
  let earliestIndex = -1;
  let matchLength = 0;

  for (const term of normalizedTerms) {
    if (!term) {
      continue;
    }
    const index = lower.indexOf(term);
    if (index !== -1 && (earliestIndex === -1 || index < earliestIndex)) {
      earliestIndex = index;
      matchLength = term.length;
    }
  }

  if (earliestIndex === -1) {
    return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
  }

  const start = Math.max(0, earliestIndex - 60);
  const end = Math.min(text.length, start + maxLength);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  const snippet = text.slice(start, end).trimStart();

  return `${prefix}${snippet}${suffix}`;
};

const compareEntries = (a: RankedEntry, b: RankedEntry): number => {
  if (b.score !== a.score) {
    return b.score - a.score;
  }

  const dateDiff = new Date(b.entry.publishedAt).getTime() - new Date(a.entry.publishedAt).getTime();
  if (!Number.isNaN(dateDiff) && dateDiff !== 0) {
    return dateDiff;
  }

  return a.entry.question.localeCompare(b.entry.question);
};

const buildFilters = (params: SearchParams): SearchFiltersInternal => ({
  topics: new Set(params.topics.map(topic => sanitize(topic))),
  tags: new Set(params.tags.map(tag => sanitize(tag))),
  author: params.author ? sanitize(params.author) : ''
});

export async function searchQuestions(params: SearchParams): Promise<SearchResponse> {
  const trimmedQuery = params.query.trim();
  const normalizedQuery = sanitize(trimmedQuery);
  const tokens = normalizedQuery ? normalizedQuery.split(' ') : [];
  const queryTrigrams = normalizedQuery ? createTrigramSetFromSanitized(normalizedQuery) : new Set<string>();
  const filters = buildFilters(params);

  const ranked: RankedEntry[] = indexedEntries
    .filter(indexed => matchesFilters(indexed, filters))
    .map(indexed => ({
      entry: indexed.entry,
      indexed,
      score: rankEntry(indexed, tokens, queryTrigrams, normalizedQuery, filters)
    }))
    .sort(compareEntries);

  const total = ranked.length;
  const pageSize = Math.max(1, params.pageSize);
  const pageCount = total === 0 ? 1 : Math.ceil(total / pageSize);
  const initialPage = Number.isFinite(params.page) ? Math.max(1, Math.floor(params.page)) : 1;
  const page = Math.min(pageCount, initialPage);
  const start = (page - 1) * pageSize;
  const paginated = ranked.slice(start, start + pageSize);

  const displayTerms = dedupe<string>([
    ...tokens,
    ...params.topics,
    ...params.tags,
    params.author ?? ''
  ].filter(Boolean));

  const normalizedHighlightTerms = displayTerms.map(term => sanitize(term)).filter(Boolean);
  const normalizedTokenSet = new Set(tokens);

  const items = paginated.map(({ entry, indexed, score }) => {
    const snippetText = createSnippet(entry.answer, normalizedHighlightTerms);

    const matchedTopics = entry.topics.filter(topic => {
      const normalizedTopic = sanitize(topic);
      if (filters.topics.has(normalizedTopic)) {
        return true;
      }
      for (const token of normalizedTokenSet) {
        if (normalizedTopic.includes(token)) {
          return true;
        }
      }
      return false;
    });

    const matchedTags = entry.tags.filter(tag => {
      const normalizedTag = sanitize(tag);
      if (filters.tags.has(normalizedTag)) {
        return true;
      }
      for (const token of normalizedTokenSet) {
        if (normalizedTag.includes(token)) {
          return true;
        }
      }
      return false;
    });

    return {
      entry,
      score: Number(score.toFixed(4)),
      questionHighlights: createHighlightParts(entry.question, displayTerms),
      answerHighlights: createHighlightParts(entry.answer, displayTerms),
      snippet: createHighlightParts(snippetText, displayTerms),
      matchedTopics,
      matchedTags
    };
  });

  return {
    total,
    page,
    pageSize,
    pageCount,
    items
  };
}

export async function suggestQuestions(rawQuery: string, limit = 6): Promise<string[]> {
  const query = rawQuery.trim();

  if (!query) {
    return knowledgeBase
      .slice()
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit)
      .map(entry => entry.question);
  }

  const normalizedQuery = sanitize(query);
  const tokens = tokenize(query);
  const queryTrigrams = createTrigramSetFromSanitized(normalizedQuery);

  const ranked = indexedEntries
    .map(indexed => ({
      entry: indexed.entry,
      score: rankEntry(indexed, tokens, queryTrigrams, normalizedQuery, { topics: new Set(), tags: new Set(), author: '' })
    }))
    .filter(item => item.score > 0.2)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.entry.question.localeCompare(b.entry.question);
    });

  const suggestions: string[] = [];
  const seen = new Set<string>();

  for (const { entry } of ranked) {
    if (seen.has(entry.question)) {
      continue;
    }
    suggestions.push(entry.question);
    seen.add(entry.question);
    if (suggestions.length >= limit) {
      break;
    }
  }

  if (suggestions.length < limit) {
    for (const entry of knowledgeBase) {
      if (seen.has(entry.question)) {
        continue;
      }
      suggestions.push(entry.question);
      seen.add(entry.question);
      if (suggestions.length >= limit) {
        break;
      }
    }
  }

  return suggestions.slice(0, limit);
}
