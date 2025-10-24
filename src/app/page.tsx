import Link from "next/link";

import { QuestionList } from "@/components/question/QuestionList";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const questions = await prisma.question.findMany({
    include: {
      author: true,
      answers: {
        select: {
          id: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <section>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem"
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2.75rem",
              margin: "0 0 0.75rem",
              color: "#0f172a"
            }}
          >
            Ask precise questions. Share clean answers.
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: "42rem",
              color: "#334155",
              lineHeight: 1.6
            }}
          >
            signQA pairs a markdown-native editor with live code previews so you can collaborate
            quickly. Stay in flow while documenting tricky edge cases and accepted solutions.
          </p>
        </div>
        <Link
          href="/questions/new"
          style={{
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            color: "#ffffff",
            padding: "0.85rem 1.4rem",
            borderRadius: "0.75rem",
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 12px 30px rgba(79, 70, 229, 0.35)"
          }}
        >
          Ask a question
        </Link>
      </div>

      <QuestionList questions={questions} />
    </section>
  );
}
