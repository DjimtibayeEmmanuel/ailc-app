import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import AuthProvider from "./components/AuthProvider";

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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
