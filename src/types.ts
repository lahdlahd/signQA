export interface QAEntry {
  id: string;
  question: string;
  answer: string;
  topics: string[];
  tags: string[];
  author: string;
  publishedAt: string;
}

export interface HighlightPart {
  text: string;
  isMatch: boolean;
}

export interface SearchHit {
  entry: QAEntry;
  score: number;
  questionHighlights: HighlightPart[];
  answerHighlights: HighlightPart[];
  snippet: HighlightPart[];
  matchedTopics: string[];
  matchedTags: string[];
}

export interface SearchResponse {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  items: SearchHit[];
}

export interface SearchParams {
  query: string;
  topics: string[];
  tags: string[];
  author?: string;
  page: number;
  pageSize: number;
}
