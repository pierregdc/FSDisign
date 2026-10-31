import type { Metadata, Viewport } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${SITE.product} — ${SITE.sourceName} (${SITE.sourceHost})`,
  description: `${SITE.description} Compagnon officiel de la plateforme ${SITE.sourceName} (${SITE.sourceHost}).`,
  applicationName: SITE.fullName,
  authors: [{ name: SITE.name, url: SITE.websiteUrl }],
  keywords: [
    "France Student",
    "France Student IA",
    "ia.francestudent.org",
    "Offre IA",
    "Intelligent UI",
    "interface générative",
    "assistant étudiant",
    "IA",
  ],
  openGraph: {
    title: `${SITE.product} — ${SITE.sourceName} (${SITE.sourceHost})`,
    description: `${SITE.description} Compagnon officiel de la plateforme ${SITE.sourceName} (${SITE.sourceHost}).`,
    siteName: `${SITE.fullName} · ${SITE.sourceHost}`,
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.product} — ${SITE.sourceName} (${SITE.sourceHost})`,
    description: `${SITE.description} Compagnon officiel de la plateforme ${SITE.sourceName} (${SITE.sourceHost}).`,
  },
};

export const viewport: Viewport = {
  themeColor: "#0139b7",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full">{children}</body>
    </html>
  );
}
