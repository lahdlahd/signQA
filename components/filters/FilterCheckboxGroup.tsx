"use client";

import { FilterOption } from "@/lib/filtering";

interface FilterCheckboxGroupProps {
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
  name: string;
}

export function FilterCheckboxGroup({ options, selected, onToggle, name }: FilterCheckboxGroupProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {options.map((option) => {
        const isChecked = selected.includes(option.value);
        return (
          <label
            key={`${name}-${option.value}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              padding: "0.6rem 0.75rem",
              borderRadius: "10px",
              border: isChecked ? "1px solid #2563eb" : "1px solid #e2e8f0",
              backgroundColor: isChecked ? "rgba(37, 99, 235, 0.07)" : "white",
              cursor: "pointer",
              transition: "border-color 0.2s ease, background-color 0.2s ease"
            }}
          >
            <span style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0f172a" }}>
                {option.label}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#475569" }}>
                {option.count} questions
              </span>
            </span>
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={isChecked}
              onChange={() => onToggle(option.value)}
              style={{ width: "1.15rem", height: "1.15rem" }}
            />
          </label>
        );
      })}
    </div>
  );
}
