import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { ForbiddenError, UnauthorizedError, requireAuthUser } from "@/lib/auth";
import { answerSchema } from "@/lib/validation";

function parseAnswerId(value: string): number {
  const id = Number(value);
  if (Number.isNaN(id) || id <= 0) {
    throw new Error("Invalid answer id");
  }
  return id;
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const id = parseAnswerId(context.params.id);
    const { user } = await requireAuthUser(request.headers);

    const answer = await prisma.answer.findUnique({ where: { id } });
    if (!answer) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }

    if (answer.authorId !== user.id) {
      throw new ForbiddenError("You can only edit your own answers.");
    }

    const rate = checkRateLimit({
      key: `edit-answer:${user.id}`,
      limit: 20,
      windowMs: 60_000
    });

    if (rate.limited) {
      return NextResponse.json(
        { error: "You are editing answers too quickly. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rate.retryAfter ?? 60)
          }
        }
      );
    }

    const json = await request.json();
    const validation = answerSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.answer.update({
      where: { id },
      data: {
        content: validation.data.content.trim()
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

    if (error instanceof Error && error.message === "Invalid answer id") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    const id = parseAnswerId(context.params.id);
    const { user } = await requireAuthUser(request.headers);

    const answer = await prisma.answer.findUnique({ where: { id } });
    if (!answer) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }

    if (answer.authorId !== user.id) {
      throw new ForbiddenError("You can only delete your own answers.");
    }

    const rate = checkRateLimit({
      key: `delete-answer:${user.id}`,
      limit: 20,
      windowMs: 60_000
    });

    if (rate.limited) {
      return NextResponse.json(
        { error: "You are deleting answers too quickly. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rate.retryAfter ?? 60)
          }
        }
      );
    }

    await prisma.answer.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof Error && error.message === "Invalid answer id") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
