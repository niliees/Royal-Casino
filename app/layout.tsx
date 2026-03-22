import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Royal Casino",
  description: "Premium online casino — Roulette, Blackjack, Slots and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}

