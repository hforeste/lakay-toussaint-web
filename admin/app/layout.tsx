import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Admin | Lakay Toussaint",
  description: "Manage Lakay Toussaint community events.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
