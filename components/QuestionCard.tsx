import { CategoryBadge } from "./CategoryBadge";
import { Question, statusLabels } from "@/lib/questions";
import { format } from "date-fns";

function difficultyColor(difficulty: Question["difficulty"]): string {
  switch (difficulty) {
    case "Beginner":
      return "#047857";
    case "Advanced":
      return "#b91c1c";
    default:
      return "#2563eb";
  }
}

export function QuestionCard({ question }: { question: Question }) {
  return (
    <article
      style={{
        backgroundColor: "white",
        borderRadius: "18px",
        padding: "1.75rem",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        border: "1px solid rgba(226, 232, 240, 0.6)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap"
        }}
      >
        <CategoryBadge value={question.category} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "#475569",
            fontSize: "0.85rem"
          }}
        >
          <span style={{ color: difficultyColor(question.difficulty), fontWeight: 600 }}>
            {question.difficulty}
          </span>
          <span aria-hidden>•</span>
          <span>{statusLabels[question.status]}</span>
          <span aria-hidden>•</span>
          <time dateTime={question.createdAt} suppressHydrationWarning>
            {format(new Date(question.createdAt), "d MMM yyyy")}
          </time>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <h3
          style={{
            fontSize: "1.35rem",
            margin: 0,
            color: "#0f172a"
          }}
        >
          {question.title}
        </h3>
        <p style={{ margin: 0, lineHeight: 1.6, color: "#1f2937" }}>{question.body}</p>
      </div>

      <footer
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem"
        }}
      >
        {question.tags.map((tag) => (
          <span
            key={tag}
            style={{
              backgroundColor: "#f1f5f9",
              borderRadius: "999px",
              padding: "0.3rem 0.75rem",
              fontSize: "0.75rem",
              color: "#0f172a",
              fontWeight: 500
            }}
          >
            #{tag}
          </span>
        ))}
      </footer>
    </article>
  );
}
