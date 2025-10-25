"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useMemo, useState } from "react";

const navItems = [
  { href: "/", label: "Home", requiresAuth: false },
  { href: "/dashboard", label: "Dashboard", requiresAuth: true },
  { href: "/profile", label: "Profile", requiresAuth: true },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const links = useMemo(
    () =>
      navItems.filter((item) => (item.requiresAuth ? session?.user : true)),
    [session?.user]
  );

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="text-lg font-semibold text-neutral-900">
            signQA
          </Link>
        </div>
        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-neutral-600">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 transition-colors ${
                isActive(pathname, item.href)
                  ? "bg-neutral-900 text-white"
                  : "hover:bg-neutral-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="hidden rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 sm:inline-flex"
              >
                {session.user.displayName || session.user.username}
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </>
          ) : status === "loading" ? (
            <span className="text-sm text-neutral-500">Loading...</span>
          ) : (
            <div className="flex items-center gap-3 text-sm font-medium">
              <Link
                href="/login"
                className="rounded-full border border-neutral-200 px-4 py-2 transition-colors hover:bg-neutral-100"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-neutral-900 px-4 py-2 text-white transition-colors hover:bg-neutral-800"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
