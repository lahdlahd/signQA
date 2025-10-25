"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  FiltersSummary,
  QuestionFilters
} from "@/lib/filtering";
import { statusLabels } from "@/lib/questions";
import { FilterSection } from "./FilterSection";
import { FilterCheckboxGroup } from "./FilterCheckboxGroup";
import { FilterPillGroup } from "./FilterPillGroup";

interface FilterBarProps {
  summary: FiltersSummary;
  selected: QuestionFilters;
  totalResults: number;
}

type FilterKey = "category" | "difficulty" | "status" | "tag";

type SelectionMap = Record<FilterKey, string[]>;

type SelectedEntry = { label: string; value: string };

export function FilterBar({ summary, selected, totalResults }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectionMap: SelectionMap = useMemo(
    () => ({
      category: selected.categories,
      difficulty: selected.difficulties,
      status: selected.statuses,
      tag: selected.tags
    }),
    [selected]
  );

  const activeFilters: SelectedEntry[] = useMemo(() => {
    return [
      ...selected.categories.map((value) => ({ label: "Component", value })),
      ...selected.difficulties.map((value) => ({ label: "Difficulty", value })),
      ...selected.statuses.map((value) => ({ label: "Status", value: statusLabels[value] })),
      ...selected.tags.map((value) => ({ label: "Tag", value }))
    ];
  }, [selected]);

  const hasActiveFilters = activeFilters.length > 0;

  const handleToggle = (key: FilterKey, value: string) => {
    const currentValues = new Set(selectionMap[key]);
    if (currentValues.has(value)) {
      currentValues.delete(value);
    } else {
      currentValues.add(value);
    }
    updateQuery(key, Array.from(currentValues));
  };

  const updateQuery = (key: FilterKey, nextValues: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    nextValues.forEach((entry) => params.append(key, entry));

    startTransition(() => {
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  const handleReset = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["category", "difficulty", "status", "tag"].forEach((key) => params.delete(key));
    startTransition(() => {
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  return (
    <aside
      style={{
        flex: "0 0 320px",
        backgroundColor: "white",
        borderRadius: "20px",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        position: "sticky",
        top: "1.5rem",
        maxHeight: "calc(100vh - 3rem)",
        overflowY: "auto"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "1.1rem",
            color: "#0f172a",
            fontWeight: 700
          }}
        >
          Refine questions
        </h2>
        <p style={{ margin: 0, color: "#475569", fontSize: "0.85rem" }}>
          {totalResults} results · SIGN framework
        </p>
        {hasActiveFilters ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
              marginTop: "0.75rem"
            }}
          >
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569" }}>
              Active filters
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {activeFilters.map((item) => (
                <span
                  key={`${item.label}-${item.value}`}
                  style={{
                    backgroundColor: "#e2e8f0",
                    color: "#0f172a",
                    fontSize: "0.7rem",
                    padding: "0.2rem 0.55rem",
                    borderRadius: "999px",
                    fontWeight: 600
                  }}
                >
                  {item.label}: {item.value}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <FilterSection title="SIGN component">
        <FilterCheckboxGroup
          name="category"
          options={summary.categories}
          selected={selected.categories}
          onToggle={(value) => handleToggle("category", value)}
        />
      </FilterSection>

      <FilterSection title="Difficulty">
        <FilterCheckboxGroup
          name="difficulty"
          options={summary.difficulties}
          selected={selected.difficulties}
          onToggle={(value) => handleToggle("difficulty", value)}
        />
      </FilterSection>

      <FilterSection title="Status">
        <FilterCheckboxGroup
          name="status"
          options={summary.statuses}
          selected={selected.statuses}
          onToggle={(value) => handleToggle("status", value)}
        />
      </FilterSection>

      <FilterSection title="Tags" description="Combine multiple tags to hone in on crowdsourced knowledge gaps.">
        <FilterPillGroup
          options={summary.tags}
          selected={selected.tags}
          onToggle={(value) => handleToggle("tag", value)}
        />
      </FilterSection>

      <button
        type="button"
        onClick={handleReset}
        disabled={!hasActiveFilters || isPending}
        style={{
          marginTop: "0.5rem",
          padding: "0.65rem 1rem",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          backgroundColor: hasActiveFilters ? "#f1f5f9" : "#f8fafc",
          color: hasActiveFilters ? "#0f172a" : "#94a3b8",
          fontWeight: 600,
          cursor: hasActiveFilters ? "pointer" : "not-allowed"
        }}
      >
        {isPending ? "Updating filters…" : "Reset filters"}
      </button>
    </aside>
  );
}
