import { notFound } from "next/navigation";

import { QuestionForm } from "@/components/forms/QuestionForm";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Edit question | signQA"
};

type EditPageProps = {
  params: {
    id: string;
  };
};

export default async function EditQuestionPage({ params }: EditPageProps) {
  const id = Number(params.id);
  if (Number.isNaN(id) || id <= 0) {
    notFound();
  }

  const question = await prisma.question.findUnique({
    where: { id }
  });

  if (!question) {
    notFound();
  }

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
          Update your question
        </h1>
        <p style={{ margin: 0, color: "#475569", maxWidth: "48rem" }}>
          Keep the history clear with precise titles and concise summaries so others can follow along.
        </p>
      </header>

      <QuestionForm
        mode="edit"
        questionId={question.id}
        initialValues={{
          title: question.title,
          content: question.content,
          summary: question.summary,
          tags: question.tags ?? ""
        }}
      />
    </section>
  );
}
