import { ReactNode } from "react";

interface FilterSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function FilterSection({ title, description, children }: FilterSectionProps) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "#0f172a",
            letterSpacing: "0.01em"
          }}
        >
          {title}
        </h3>
        {description ? (
          <p style={{ margin: 0, color: "#475569", fontSize: "0.85rem", lineHeight: 1.5 }}>
            {description}
          </p>
        ) : null}
      </div>
      <div>{children}</div>
    </section>
  );
}
