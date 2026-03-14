import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pantry — Recipe to Grocery List",
  description: "Turn TikTok and Instagram Reel recipes into a smart grocery list that fits your budget.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream">{children}</body>
    </html>
  );
}
