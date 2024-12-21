import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

const apple = localFont({ src: "/fonts/apple/AppleGaramond.ttf" });

export const metadata: Metadata = {
  title: "Shell Finder",
  description: "Find shell companies, as easy as finding shells at the beach.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={apple.className}>{children}</body>
    </html>
  );
}
