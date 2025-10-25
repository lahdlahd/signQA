"use client";

interface FilterPillGroupProps {
  options: { value: string; label: string; count: number }[];
  selected: string[];
  onToggle: (value: string) => void;
}

export function FilterPillGroup({ options, selected, onToggle }: FilterPillGroupProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {options.map((option) => {
        const isActive = selected.includes(option.value);
        return (
          <button
            key={`tag-${option.value}`}
            type="button"
            onClick={() => onToggle(option.value)}
            style={{
              border: "1px solid",
              borderColor: isActive ? "#7c3aed" : "#e2e8f0",
              backgroundColor: isActive ? "rgba(124, 58, 237, 0.12)" : "white",
              color: isActive ? "#5b21b6" : "#334155",
              padding: "0.35rem 0.75rem",
              borderRadius: "999px",
              fontSize: "0.8rem",
              fontWeight: 500,
              display: "flex",
              gap: "0.35rem",
              alignItems: "center",
              cursor: "pointer"
            }}
          >
            <span>#{option.label}</span>
            <span
              style={{
                backgroundColor: isActive ? "#5b21b6" : "#e2e8f0",
                color: isActive ? "white" : "#475569",
                borderRadius: "999px",
                padding: "0.1rem 0.4rem",
                fontSize: "0.7rem"
              }}
            >
              {option.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
