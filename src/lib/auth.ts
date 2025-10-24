import type { User } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type DemoUser = {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
};

export const demoUsers: DemoUser[] = [
  {
    id: 1,
    name: "Ada Lovelace",
    email: "ada@example.com",
    avatarUrl: "https://avatars.dicebear.com/api/initials/Ada%20Lovelace.svg"
  },
  {
    id: 2,
    name: "Grace Hopper",
    email: "grace@example.com",
    avatarUrl: "https://avatars.dicebear.com/api/initials/Grace%20Hopper.svg"
  },
  {
    id: 3,
    name: "Alan Turing",
    email: "alan@example.com",
    avatarUrl: "https://avatars.dicebear.com/api/initials/Alan%20Turing.svg"
  }
];

export const AUTH_HEADER_KEY = "x-user-id";

export class UnauthorizedError extends Error {
  status = 401;

  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  status = 403;

  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requireAuthUser(headers: Headers): Promise<{
  demoUser: DemoUser;
  user: User;
}> {
  const headerValue = headers.get(AUTH_HEADER_KEY);
  if (!headerValue) {
    throw new UnauthorizedError("Missing authentication header");
  }

  const numericId = Number(headerValue);
  if (Number.isNaN(numericId)) {
    throw new UnauthorizedError("Invalid authentication token");
  }

  const demoUser = demoUsers.find((user) => user.id === numericId);
  if (!demoUser) {
    throw new UnauthorizedError("User not recognized");
  }

  const user = await prisma.user.upsert({
    where: { email: demoUser.email },
    update: {
      name: demoUser.name,
      avatarUrl: demoUser.avatarUrl
    },
    create: {
      id: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
      avatarUrl: demoUser.avatarUrl
    }
  });

  return { demoUser, user };
}

export function getDemoUserById(id: number): DemoUser | undefined {
  return demoUsers.find((user) => user.id === id);
}
