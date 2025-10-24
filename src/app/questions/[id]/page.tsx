import { notFound } from "next/navigation";

import { QuestionDetailView } from "@/components/question/QuestionDetailView";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type QuestionPageProps = {
  params: {
    id: string;
  };
};

export default async function QuestionDetailPage({ params }: QuestionPageProps) {
  const id = Number(params.id);
  if (Number.isNaN(id) || id <= 0) {
    notFound();
  }

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      author: true,
      comments: {
        include: {
          author: true
        },
        orderBy: {
          createdAt: "asc"
        }
      },
      answers: {
        include: {
          author: true,
          comments: {
            include: {
              author: true
            },
            orderBy: {
              createdAt: "asc"
            }
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  if (!question) {
    notFound();
  }

  const tags = question.tags
    ?.split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  let relatedQuestions: Array<{ id: number; title: string; createdAt: Date }> = [];

  if (tags && tags.length > 0) {
    relatedQuestions = await prisma.question.findMany({
      where: {
        id: {
          not: question.id
        },
        OR: tags.map((tag) => ({
          tags: {
            contains: tag
          }
        }))
      },
      select: {
        id: true,
        title: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    });
  }

  if (relatedQuestions.length === 0) {
    relatedQuestions = await prisma.question.findMany({
      where: {
        id: {
          not: question.id
        }
      },
      select: {
        id: true,
        title: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    });
  }

  return <QuestionDetailView question={question} relatedQuestions={relatedQuestions} />;
}
