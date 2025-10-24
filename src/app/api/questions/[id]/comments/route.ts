import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { UnauthorizedError, requireAuthUser } from "@/lib/auth";
import { commentSchema } from "@/lib/validation";

function parseQuestionId(value: string): number {
  const id = Number(value);
  if (Number.isNaN(id) || id <= 0) {
    throw new Error("Invalid question id");
  }
  return id;
}

export async function POST(request: Request, context: { params: { id: string } }) {
  try {
    const questionId = parseQuestionId(context.params.id);
    const { user } = await requireAuthUser(request.headers);

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const rate = checkRateLimit({
      key: `comment-question:${user.id}`,
      limit: 30,
      windowMs: 60_000
    });

    if (rate.limited) {
      return NextResponse.json(
        { error: "You are commenting too quickly. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rate.retryAfter ?? 60)
          }
        }
      );
    }

    const json = await request.json();
    const validation = commentSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        questionId,
        body: validation.data.body.trim(),
        authorId: user.id
      },
      include: {
        author: true
      }
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof Error && error.message === "Invalid question id") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
