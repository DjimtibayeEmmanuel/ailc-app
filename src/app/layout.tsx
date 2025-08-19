import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AILC Tchad - Signalement de Corruption",
  description: "Plateforme sécurisée de signalement de corruption pour l'AILC Tchad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
