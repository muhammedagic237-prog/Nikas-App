import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "GarageFlow",
  description: "Repair-shop workflow app for small garages and service centers."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
