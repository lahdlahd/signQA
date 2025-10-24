import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/components/layout/AuthProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "signQA - Questions & Answers for developers",
  description: "Collaborative Q&A platform with live markdown preview and syntax highlighting",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div
            style={{
              minHeight: "100vh",
              background: "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #f8fafc 100%)",
              color: "#0f172a"
            }}
          >
            <SiteHeader />
            <main>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
