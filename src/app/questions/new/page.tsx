import { QuestionForm } from "@/components/forms/QuestionForm";

export const metadata = {
  title: "Ask a question | signQA"
};

export default function NewQuestionPage() {
  return (
    <section
      style={{
        display: "grid",
        gap: "1.75rem"
      }}
    >
      <header>
        <h1
          style={{
            fontSize: "2rem",
            marginBottom: "0.5rem",
            color: "#0f172a"
          }}
        >
          Ask a new question
        </h1>
        <p style={{ margin: 0, color: "#475569", maxWidth: "48rem" }}>
          Provide enough context and show what you have tried so far. Use the markdown editor to share
          reproducible examples with syntax highlighting automatically applied.
        </p>
      </header>

      <QuestionForm mode="create" />
    </section>
  );
}
