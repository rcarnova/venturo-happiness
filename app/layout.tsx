import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Venturo · Happiness Survey",
  description: "Misura il benessere organizzativo in modo anonimo e continuo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
