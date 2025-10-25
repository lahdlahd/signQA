import { describe, expect, it } from 'vitest';
import { searchQuestions, suggestQuestions } from '../../lib/search';

const baseParams = {
  topics: [] as string[],
  tags: [] as string[],
  page: 1,
  pageSize: 10
};

describe('searchQuestions', () => {
  it('ranks the most relevant entries for focused keyword searches', async () => {
    const response = await searchQuestions({ ...baseParams, query: 'fingerspelling speed' });

    expect(response.total).toBeGreaterThan(0);
    expect(response.items[0].entry.id).toBe('asl-fingerspelling-speed');
    expect(response.items[0].questionHighlights.some(part => part.isMatch && /fingerspelling/i.test(part.text))).toBe(true);
  });

  it('filters by tags and author to narrow results', async () => {
    const response = await searchQuestions({
      ...baseParams,
      query: '',
      tags: ['video'],
      author: 'Avery Johnson'
    });

    expect(response.total).toBe(1);
    expect(response.items[0].entry.id).toBe('recording-setup');
    expect(response.items[0].matchedTags).toContain('video');
  });

  it('highlights matched snippets in the answer body', async () => {
    const response = await searchQuestions({ ...baseParams, query: 'facial grammar practice' });

    expect(response.total).toBeGreaterThan(0);
    const snippetParts = response.items[0].snippet;
    expect(snippetParts.some(part => part.isMatch)).toBe(true);
  });
});

describe('suggestQuestions', () => {
  it('provides autosuggest entries ordered by relevance', async () => {
    const suggestions = await suggestQuestions('facial grammar');

    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0]).toMatch(/facial grammar/i);
  });

  it('falls back to recent content when query is empty', async () => {
    const suggestions = await suggestQuestions('');

    expect(suggestions.length).toBeGreaterThan(0);
  });
});
