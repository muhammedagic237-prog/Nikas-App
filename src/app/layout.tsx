import type { Metadata } from "next";
import type { Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Nika's App",
  description: "A block-world game and drawing app for Nika."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
