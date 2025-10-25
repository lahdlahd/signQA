import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      username: string;
      displayName: string;
      bio: string;
      expertise: string;
    };
  }

  interface User {
    username: string;
    displayName: string | null;
    bio: string | null;
    expertise: string | null;
  }
}
