import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Usernames can only include letters, numbers, and underscores"
    ),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must be 64 characters or less"),
  displayName: z.string().max(64, "Display name must be 64 characters or less").optional(),
  bio: z.string().max(512, "Bio must be 512 characters or less").optional(),
  expertise: z
    .string()
    .max(128, "Expertise must be 128 characters or less")
    .optional(),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = registerSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { username, email, password, displayName, bio, expertise } = parsed.data;

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: normalizedUsername },
          { email: normalizedEmail },
        ],
      },
      select: {
        username: true,
        email: true,
      },
    });

    if (existing) {
      const conflictField =
        existing.email === normalizedEmail ? "email" : "username";
      const message =
        conflictField === "email"
          ? "An account with this email already exists"
          : "This username is already taken";

      return NextResponse.json({ error: message }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);

    await prisma.user.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
        name: displayName?.trim() || normalizedUsername,
        displayName: displayName?.trim() || normalizedUsername,
        bio: bio?.trim() || null,
        expertise: expertise?.trim() || null,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to register user", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
