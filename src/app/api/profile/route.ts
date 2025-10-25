import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(64, "Display name must be 64 characters or less"),
  bio: z
    .string()
    .max(512, "Bio must be 512 characters or less")
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    }),
  expertise: z
    .string()
    .max(128, "Expertise must be 128 characters or less")
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    }),
});

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = profileSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { displayName, bio, expertise } = parsed.data;

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        displayName: displayName.trim(),
        name: displayName.trim(),
        bio: bio ?? null,
        expertise: expertise ?? null,
      },
      select: {
        displayName: true,
        bio: true,
        expertise: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update profile", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
