import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { auth } from "@/auth";
import { Header } from "@/components/layout/header";
import { AuthSessionProvider } from "@/components/providers/auth-session-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "signQA",
  description:
    "Secure authentication and profile management for the signQA knowledge platform.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-neutral-50 text-neutral-900 antialiased`}
      >
        <AuthSessionProvider session={session}>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10">
              {children}
            </main>
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
