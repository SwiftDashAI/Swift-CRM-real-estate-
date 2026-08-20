import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swift CRM | SwiftDash AI",
  description: "Never lose a customer. A lightweight CRM for real-estate professionals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-ink-900 antialiased">{children}</body>
    </html>
  );
}
