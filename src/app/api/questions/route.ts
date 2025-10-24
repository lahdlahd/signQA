import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { createUniqueSlug, slugify } from "@/lib/slugify";
import { UnauthorizedError, requireAuthUser } from "@/lib/auth";
import { questionSchema } from "@/lib/validation";

export async function GET() {
  const questions = await prisma.question.findMany({
    include: {
      author: true,
      _count: {
        select: {
          answers: true,
          comments: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return NextResponse.json({ questions });
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAuthUser(request.headers);

    const rate = checkRateLimit({
      key: `create-question:${user.id}`,
      limit: 4,
      windowMs: 60_000
    });

    if (rate.limited) {
      return NextResponse.json(
        { error: "Too many questions created. Please slow down." },
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
        {
          error: "Validation failed",
          details: validation.error.flatten()
        },
        { status: 400 }
      );
    }

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
      ).map((item) => item.slug)
    );

    const slug = await createUniqueSlug(validation.data.title, existingSlugs);

    const question = await prisma.question.create({
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
        slug,
        authorId: user.id
      }
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
