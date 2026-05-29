import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "24/7 Emergency Plumbing Services in NYC | F&E NYC Plumbing",
  description:
    "Fast, licensed, and insured emergency plumbers serving Manhattan, Brooklyn, Queens, Bronx, and Staten Island.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
