import {
  QUESTIONS,
  Question,
  FrameworkComponent,
  Difficulty,
  QuestionStatus,
  frameworkComponents,
  difficulties,
  statuses,
  statusLabels,
  allTags
} from "./questions";

export interface QuestionFilters {
  categories: FrameworkComponent[];
  difficulties: Difficulty[];
  tags: string[];
  statuses: QuestionStatus[];
}

type SearchParamRecord = Record<string, string | string[] | undefined>;

export const EMPTY_FILTERS: QuestionFilters = {
  categories: [],
  difficulties: [],
  tags: [],
  statuses: []
};

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((entry) => entry.split(","));
  return value.split(",");
}

function normaliseString(value: string): string {
  return value.trim();
}

export function parseFiltersFromSearchParams(params: URLSearchParams): QuestionFilters {
  return sanitiseFilters({
    categories: params.getAll("category").flatMap((entry) => entry.split(",")),
    difficulties: params.getAll("difficulty").flatMap((entry) => entry.split(",")),
    tags: params.getAll("tag").flatMap((entry) => entry.split(",")),
    statuses: params.getAll("status").flatMap((entry) => entry.split(","))
  });
}

export function parseFilters(params: SearchParamRecord): QuestionFilters {
  return sanitiseFilters({
    categories: toArray(params.category),
    difficulties: toArray(params.difficulty),
    tags: toArray(params.tag),
    statuses: toArray(params.status)
  });
}

function sanitiseFilters(filters: Partial<QuestionFilters>): QuestionFilters {
  const categorySet = new Set(frameworkComponents);
  const difficultySet = new Set(difficulties);
  const statusSet = new Set(statuses);
  const tagLookup = new Map(allTags.map((tag) => [tag.toLowerCase(), tag]));

  return {
    categories: dedupe(filters.categories).filter((value): value is FrameworkComponent =>
      categorySet.has(value as FrameworkComponent)
    ),
    difficulties: dedupe(filters.difficulties).filter((value): value is Difficulty =>
      difficultySet.has(value as Difficulty)
    ),
    tags: dedupe(filters.tags)
      .map((value) => tagLookup.get(value.toLowerCase()))
      .filter((value): value is string => Boolean(value)),
    statuses: dedupe(filters.statuses).filter((value): value is QuestionStatus =>
      statusSet.has(value as QuestionStatus)
    )
  };
}

function dedupe(values: string[] | undefined): string[] {
  if (!values?.length) return [];
  const set = new Set<string>();
  values.forEach((value) => {
    const cleaned = normaliseString(value);
    if (cleaned.length > 0) {
      set.add(cleaned);
    }
  });
  return Array.from(set);
}

export function applyFilters(questions: Question[], filters: QuestionFilters): Question[] {
  return questions.filter((question) => matchesFilters(question, filters));
}

function matchesFilters(question: Question, filters: QuestionFilters): boolean {
  if (filters.categories.length && !filters.categories.includes(question.category)) {
    return false;
  }
  if (filters.difficulties.length && !filters.difficulties.includes(question.difficulty)) {
    return false;
  }
  if (filters.statuses.length && !filters.statuses.includes(question.status)) {
    return false;
  }
  if (filters.tags.length) {
    const tagSet = new Set(question.tags.map((tag) => tag.toLowerCase()));
    const allMatch = filters.tags.every((tag) => tagSet.has(tag.toLowerCase()));
    if (!allMatch) {
      return false;
    }
  }
  return true;
}

export function serialiseFilters(filters: QuestionFilters): string {
  const params = new URLSearchParams();
  filters.categories.forEach((category) => params.append("category", category));
  filters.difficulties.forEach((difficulty) => params.append("difficulty", difficulty));
  filters.tags.forEach((tag) => params.append("tag", tag));
  filters.statuses.forEach((status) => params.append("status", status));
  const query = params.toString();
  return query.length ? `?${query}` : "";
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface FiltersSummary {
  categories: FilterOption[];
  difficulties: FilterOption[];
  tags: FilterOption[];
  statuses: FilterOption[];
}

interface DimensionMap<T extends string> {
  collection: T[];
  toLabel: (value: T) => string;
}

const CATEGORY_DIMENSION: DimensionMap<FrameworkComponent> = {
  collection: frameworkComponents,
  toLabel: (value) => value
};

const DIFFICULTY_DIMENSION: DimensionMap<Difficulty> = {
  collection: difficulties,
  toLabel: (value) => value
};

const STATUS_DIMENSION: DimensionMap<QuestionStatus> = {
  collection: statuses,
  toLabel: (value) => statusLabels[value]
};

export function buildFiltersSummary(
  questions: Question[],
  filters: QuestionFilters
): FiltersSummary {
  return {
    categories: buildDimensionSummary(questions, filters, "categories", CATEGORY_DIMENSION),
    difficulties: buildDimensionSummary(questions, filters, "difficulties", DIFFICULTY_DIMENSION),
    statuses: buildDimensionSummary(questions, filters, "statuses", STATUS_DIMENSION),
    tags: buildTagSummary(questions, filters)
  };
}

function buildTagSummary(questions: Question[], filters: QuestionFilters): FilterOption[] {
  const clearedFilters = { ...filters, tags: [] };

  return allTags.map((tag) => {
    const nextFilters: QuestionFilters = {
      ...clearedFilters,
      tags: [tag]
    };

    return {
      value: tag,
      label: tag,
      count: applyFilters(questions, nextFilters).length
    };
  });
}

function buildDimensionSummary<T extends keyof QuestionFilters, U extends string>(
  questions: Question[],
  filters: QuestionFilters,
  dimensionKey: T,
  dimension: DimensionMap<U>
): FilterOption[] {
  const clearedFilters = { ...filters, [dimensionKey]: [] } as QuestionFilters;

  return dimension.collection.map((value) => {
    const nextFilters = {
      ...clearedFilters,
      [dimensionKey]: [value]
    } as QuestionFilters;

    return {
      value,
      label: dimension.toLabel(value),
      count: applyFilters(questions, nextFilters).length
    };
  });
}

export function getQuestionsWithFilters(filters: QuestionFilters) {
  const filtered = applyFilters(QUESTIONS, filters).sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1
  );
  const summary = buildFiltersSummary(QUESTIONS, filters);
  return { filtered, summary };
}
