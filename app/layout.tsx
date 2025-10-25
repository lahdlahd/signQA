import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "signQA | Question Explorer",
  description:
    "Explore SIGN framework questions with intuitive filters for strategy, implementation, governance, networking, difficulty, tags, and status.",
  openGraph: {
    title: "signQA | Question Explorer",
    description:
      "Categorize and discover SIGN framework questions by component, difficulty, tags, and status.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
