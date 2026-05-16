import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Nika's App",
  description: "A block-world game and drawing app for Nika."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
