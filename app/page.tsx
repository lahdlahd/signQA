import type { Metadata } from "next";

import { FilterBar } from "@/components/filters/FilterBar";
import { QuestionCard } from "@/components/QuestionCard";
import {
  EMPTY_FILTERS,
  getQuestionsWithFilters,
  parseFilters,
  serialiseFilters
} from "@/lib/filtering";
import { QUESTIONS, statusLabels } from "@/lib/questions";

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export function generateMetadata({ searchParams }: PageProps): Metadata {
  const filters = parseFilters(searchParams);
  const filtersSummary = createFilterSummary(filters);

  const titleSuffix = filtersSummary.length
    ? `Focused on ${filtersSummary.join(" · ")}`
    : "SIGN Framework Questions";

  return {
    title: `signQA | ${titleSuffix}`,
    description:
      "Server-rendered SIGN framework questions. Combine component, difficulty, tag, and status filters to discover insights."
  };
}

export default function QuestionsPage({ searchParams }: PageProps) {
  const filters = parseFilters(searchParams);
  const { filtered: questions, summary } = getQuestionsWithFilters(filters);

  return (
    <main style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          maxWidth: "1160px",
          width: "100%",
          margin: "0 auto",
          padding: "3rem 1.5rem",
          display: "flex",
          gap: "2rem"
        }}
      >
        <FilterBar summary={summary} selected={filters} totalResults={questions.length} />

        <section style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          <header style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "2rem",
                  color: "#0f172a",
                  fontWeight: 800
                }}
              >
                SIGN question explorer
              </h1>
              <p style={{ margin: "0.25rem 0 0", fontSize: "1rem", color: "#475569" }}>
                Classify questions by SIGN framework pillar, match the right level of challenge, and surface relevant tags in a single list.
              </p>
            </div>
            <div style={{ color: "#475569", fontSize: "0.85rem" }}>
              Showing <strong>{questions.length}</strong> of the {" "}
              <strong>{QUESTIONS.length}</strong> curated questions. Filters sync with the URL via server-side rendering for SEO friendly discovery.
            </div>
          </header>

          {questions.length === 0 ? (
            <EmptyState filtersLabel={createFilterSummary(filters).join(", ") || "all filters"} />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.5rem"
              }}
            >
              {questions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function createFilterSummary(filters: ReturnType<typeof parseFilters>): string[] {
  const tokens: string[] = [];
  if (filters.categories.length) {
    tokens.push(`components: ${filters.categories.join(" & ")}`);
  }
  if (filters.difficulties.length) {
    tokens.push(`difficulty: ${filters.difficulties.join(" & ")}`);
  }
  if (filters.statuses.length) {
    tokens.push(`status: ${filters.statuses.map((key) => statusLabels[key]).join(" & ")}`);
  }
  if (filters.tags.length) {
    tokens.push(`tags: ${filters.tags.join(" & ")}`);
  }
  return tokens;
}

function EmptyState({ filtersLabel }: { filtersLabel: string }) {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "20px",
        border: "1px dashed #cbd5f5",
        padding: "3rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        alignItems: "center",
        textAlign: "center"
      }}
    >
      <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#1e293b" }}>No questions yet</h2>
      <p style={{ margin: 0, color: "#475569", maxWidth: "420px", lineHeight: 1.6 }}>
        We couldn’t match any questions using {filtersLabel}. Try relaxing your filters or
        combining fewer tags to reopen the search space.
      </p>
      <a
        href={buildResetHref()}
        style={{
          marginTop: "0.5rem",
          padding: "0.75rem 1.4rem",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
          color: "white",
          fontWeight: 600,
          boxShadow: "0 10px 20px rgba(79, 70, 229, 0.25)"
        }}
      >
        Reset filters
      </a>
    </div>
  );
}

function buildResetHref(): string {
  const emptyQuery = serialiseFilters(EMPTY_FILTERS);
  return emptyQuery.length ? `/${emptyQuery}` : "/";
}
