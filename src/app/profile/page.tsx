import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ProfileForm } from "@/components/profile/profile-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Profile | signQA",
  description:
    "Manage your signQA profile, including display name, bio, and expertise.",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      displayName: true,
      bio: true,
      expertise: true,
      email: true,
      username: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900">Profile</h1>
        <p className="text-neutral-600">
          Keep your details up-to-date so other contributors know your areas of
          expertise.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Profile information</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Your display name, bio, and expertise will appear across signQA.
          </p>

          <div className="mt-6">
            <ProfileForm
              initialData={{
                displayName: user.displayName || session.user.username,
                bio: user.bio,
                expertise: user.expertise,
              }}
            />
          </div>
        </div>

        <aside className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Account summary</h2>
          <dl className="mt-4 space-y-3 text-sm text-neutral-700">
            <div>
              <dt className="font-medium text-neutral-600">Email</dt>
              <dd className="mt-1 break-words text-neutral-900">{user.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-600">Username</dt>
              <dd className="mt-1 text-neutral-900">{user.username}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-600">Expertise</dt>
              <dd className="mt-1 text-neutral-900">
                {user.expertise || "Not specified"}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-neutral-500">
            OAuth accounts linked via GitHub will appear here automatically.
          </p>
        </aside>
      </section>
    </div>
  );
}
