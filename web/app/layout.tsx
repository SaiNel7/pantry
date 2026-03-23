import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MISE — What's the move tonight?",
  description: "Student-friendly meal suggestions by effort level, with a built-in grocery list.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black">{children}</body>
    </html>
  );
}
