import Link from "next/link";

import { auth } from "@/auth";

const features = [
  {
    title: "Credential login",
    description:
      "Secure, hashed password authentication with username or email support.",
  },
  {
    title: "OAuth ready",
    description:
      "Drop-in GitHub OAuth integration – just add your client credentials.",
  },
  {
    title: "Profile management",
    description:
      "Users can enrich their profile with display names, bios, and expertise.",
  },
];

export default async function Home() {
  const session = await auth();

  return (
    <section className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <span className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Welcome to signQA
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-neutral-900 sm:text-5xl">
          Authentication and profiles that help your experts focus on sharing
          knowledge.
        </h1>
        <p className="max-w-2xl text-lg text-neutral-600">
          This starter kit wires together Next.js, Auth.js (NextAuth), and Prisma
          so you can move quickly without compromising on security. Manage
          credential-based logins, optional OAuth providers, and rich profile data
          with ease.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Create an account
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-neutral-900">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-600">
        <p>
          Ready to plug in your own providers? Make sure to update your
          <code className="mx-1 rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
            .env
          </code>
          file with an
          <code className="mx-1 rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
            AUTH_SECRET
          </code>
          and any OAuth client credentials, run
          <code className="mx-1 rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
            npx prisma migrate dev
          </code>
          , then start developing with confidence.
        </p>
      </div>
    </section>
  );
}
