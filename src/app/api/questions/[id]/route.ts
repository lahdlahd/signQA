import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { createUniqueSlug, slugify } from "@/lib/slugify";
import { ForbiddenError, UnauthorizedError, requireAuthUser } from "@/lib/auth";
import { questionSchema } from "@/lib/validation";

function parseQuestionId(value: string): number {
  const id = Number(value);
  if (Number.isNaN(id) || id <= 0) {
    throw new Error("Invalid question id");
  }
  return id;
}

export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = parseQuestionId(context.params.id);
    const question = await prisma.question.findUnique({
      where: {
        id
      },
      include: {
        author: true,
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
        },
        comments: {
          include: {
            author: true
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ question });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid question id") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const id = parseQuestionId(context.params.id);
    const { user } = await requireAuthUser(request.headers);

    const question = await prisma.question.findUnique({
      where: { id }
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (question.authorId !== user.id) {
      throw new ForbiddenError("You can only edit your own question.");
    }

    const rate = checkRateLimit({
      key: `edit-question:${user.id}`,
      limit: 10,
      windowMs: 60_000
    });

    if (rate.limited) {
      return NextResponse.json(
        { error: "Too many edits. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rate.retryAfter ?? 60)
          }
        }
      );
    }

    const json = await request.json();
    const validation = questionSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    let slug = question.slug;
    if (question.title.trim() !== validation.data.title.trim()) {
      const baseSlug = slugify(validation.data.title);
      const existingSlugs = new Set(
        (
          await prisma.question.findMany({
            where: {
              slug: {
                startsWith: baseSlug
              }
            },
            select: {
              slug: true
            }
          })
        )
          .map((item) => item.slug)
          .filter((value) => value !== question.slug)
      );

      slug = await createUniqueSlug(validation.data.title, existingSlugs);
    }

    const updated = await prisma.question.update({
      where: { id },
      data: {
        title: validation.data.title.trim(),
        content: validation.data.content.trim(),
        summary: validation.data.summary?.trim() || null,
        tags: validation.data.tags
          ? validation.data.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
              .slice(0, 5)
              .join(",")
          : null,
        slug
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof Error && error.message === "Invalid question id") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    const id = parseQuestionId(context.params.id);
    const { user } = await requireAuthUser(request.headers);

    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (question.authorId !== user.id) {
      throw new ForbiddenError("You can only delete your own question.");
    }

    const rate = checkRateLimit({
      key: `delete-question:${user.id}`,
      limit: 10,
      windowMs: 60_000
    });

    if (rate.limited) {
      return NextResponse.json(
        { error: "Too many delete operations. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rate.retryAfter ?? 60)
          }
        }
      );
    }

    await prisma.question.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof Error && error.message === "Invalid question id") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
