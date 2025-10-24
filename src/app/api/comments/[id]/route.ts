import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { ForbiddenError, UnauthorizedError, requireAuthUser } from "@/lib/auth";
import { commentSchema } from "@/lib/validation";

function parseCommentId(value: string): number {
  const id = Number(value);
  if (Number.isNaN(id) || id <= 0) {
    throw new Error("Invalid comment id");
  }
  return id;
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const id = parseCommentId(context.params.id);
    const { user } = await requireAuthUser(request.headers);

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.authorId !== user.id) {
      throw new ForbiddenError("You can only edit your own comments.");
    }

    const rate = checkRateLimit({
      key: `edit-comment:${user.id}`,
      limit: 40,
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
    const validation = commentSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: {
        body: validation.data.body.trim()
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

    if (error instanceof Error && error.message === "Invalid comment id") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    const id = parseCommentId(context.params.id);
    const { user } = await requireAuthUser(request.headers);

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.authorId !== user.id) {
      throw new ForbiddenError("You can only delete your own comments.");
    }

    const rate = checkRateLimit({
      key: `delete-comment:${user.id}`,
      limit: 40,
      windowMs: 60_000
    });

    if (rate.limited) {
      return NextResponse.json(
        { error: "Too many deletions. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rate.retryAfter ?? 60)
          }
        }
      );
    }

    await prisma.comment.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof Error && error.message === "Invalid comment id") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
