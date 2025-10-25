import { FrameworkComponent } from "@/lib/questions";

const CATEGORY_STYLES: Record<FrameworkComponent, { background: string; color: string }> = {
  Strategy: { background: "#ecfdf5", color: "#047857" },
  Implementation: { background: "#eff6ff", color: "#1d4ed8" },
  Governance: { background: "#fef3c7", color: "#b45309" },
  Networking: { background: "#f5f3ff", color: "#6d28d9" }
};

export function CategoryBadge({ value }: { value: FrameworkComponent }) {
  const style = CATEGORY_STYLES[value];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.2rem 0.65rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        lineHeight: 1.2,
        backgroundColor: style.background,
        color: style.color
      }}
    >
      {value}
    </span>
  );
}
