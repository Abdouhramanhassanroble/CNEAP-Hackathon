import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carte des lycées — Visualisation & indicateurs",
  description:
    "Visualisez et analysez les établissements scolaires sur une carte interactive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
