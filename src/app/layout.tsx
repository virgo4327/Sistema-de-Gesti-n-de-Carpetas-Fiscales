import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://sistema-de-gestion-de-carpetas-fisc.vercel.app'),
  title: "DEPDICC — Sistema de Gestión de Carpetas Fiscales",
  description: "Plataforma oficial de la Unidad de Delitos contra la Administración Pública (DEPDICC) PNP Iquitos para la gestión, control y monitoreo de plazos en carpetas fiscales y procesos de investigación.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "DEPDICC — Sistema de Gestión de Carpetas Fiscales",
    description: "Plataforma oficial de control de plazos y gestión de carpetas de investigación para la DEPDICC Iquitos.",
    url: 'https://sistema-de-gestion-de-carpetas-fisc.vercel.app',
    siteName: 'DEPDICC Carpetas Fiscales',
    locale: 'es_PE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "DEPDICC — Sistema de Gestión",
    description: "Sistema avanzado de monitoreo de plazos e investigación de carpetas fiscales de la PNP.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
