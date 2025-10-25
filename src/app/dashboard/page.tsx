import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Dashboard | signQA",
  description: "Overview of your signQA profile and account activity.",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900">
          Welcome back, {session.user.displayName || session.user.username}!
        </h1>
        <p className="text-neutral-600">
          This is your central hub for managing profile information and secure
          access to signQA.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Account details</h2>
          <dl className="mt-3 space-y-2 text-sm text-neutral-700">
            <div className="flex items-start justify-between gap-3">
              <dt className="font-medium text-neutral-600">Email</dt>
              <dd className="text-right text-neutral-900">{session.user.email}</dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="font-medium text-neutral-600">Username</dt>
              <dd className="text-right text-neutral-900">{session.user.username}</dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="font-medium text-neutral-600">Expertise</dt>
              <dd className="text-right text-neutral-900">
                {session.user.expertise || "Not specified yet"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Profile bio</h2>
          <p className="mt-3 text-sm text-neutral-700">
            {session.user.bio || "Add a short bio so collaborators know how you can help."}
          </p>
          <Link
            href="/profile"
            className="mt-4 inline-flex rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
          >
            Update profile
          </Link>
        </div>
      </section>
    </div>
  );
}
