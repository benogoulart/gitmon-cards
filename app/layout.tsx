import type { Metadata } from "next";
import { baseUrl } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl()),
  title: {
    default: "Gitmon Cards",
    template: "%s — Gitmon Cards",
  },
  description:
    "Cartas de trading card game geradas a partir de dados reais do GitHub. Uma URL de imagem, sem login, embutível em qualquer README.",
  openGraph: {
    type: "website",
    siteName: "Gitmon Cards",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
