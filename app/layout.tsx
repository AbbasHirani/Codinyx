import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Codinyx — AI Coding Mentor",
  description: "Progressive hints, step-by-step debugging, and personalized DSA learning",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
