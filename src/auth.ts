import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  password: z.string().min(1, "Password is required"),
});

function sanitizeSeed(value?: string | null) {
  return value
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 32);
}

function buildUsernameSeed(email?: string | null, name?: string | null) {
  const fromEmail = sanitizeSeed(email?.split("@")[0]);
  if (fromEmail && fromEmail.length >= 3) {
    return fromEmail;
  }

  const fromName = sanitizeSeed(name);
  if (fromName && fromName.length >= 3) {
    return fromName;
  }

  return `user${Math.random().toString(36).slice(2, 10)}`;
}

const baseAdapter = PrismaAdapter(prisma);

const adapter: Adapter = {
  ...baseAdapter,
  createUser: async (data) => {
    if (!data.email) {
      throw new Error("Email is required to create a user");
    }

    const seed = buildUsernameSeed(data.email, data.name);
    let candidate = seed;
    let attempt = 0;

    while (
      await prisma.user.findUnique({
        where: { username: candidate },
        select: { id: true },
      })
    ) {
      attempt += 1;
      candidate = `${seed}${attempt}`;
    }

    const user = await prisma.user.create({
      data: {
        ...(data.id ? { id: data.id } : {}),
        email: data.email,
        emailVerified: data.emailVerified,
        image: data.image,
        name: data.name ?? candidate,
        username: candidate,
        displayName: data.name ?? candidate,
      },
    });

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      image: user.image,
    };
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "database",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { identifier, password } = parsed.data;
        const normalizedIdentifier = identifier.trim().toLowerCase();

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: normalizedIdentifier },
              { username: normalizedIdentifier },
            ],
          },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? user.name ?? user.username,
          image: user.image,
        };
      },
    }),
    ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
      ? [
          GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (!session.user) {
        return session;
      }

      const dbUser =
        user ??
        (session.user.email
          ? await prisma.user.findUnique({
              where: { email: session.user.email },
            })
          : null);

      if (!dbUser) {
        return session;
      }

      session.user.id = dbUser.id;
      session.user.email = dbUser.email;
      session.user.username = dbUser.username;
      session.user.displayName =
        dbUser.displayName ?? dbUser.name ?? dbUser.username;
      session.user.bio = dbUser.bio ?? "";
      session.user.expertise = dbUser.expertise ?? "";
      session.user.image = dbUser.image;

      return session;
    },
  },
  trustHost: true,
});
