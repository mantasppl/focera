import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans, Syne } from "next/font/google";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import Analytics from "@/components/Analytics";
import JsonLd from "@/components/JsonLd";
import {
  organizationSchema,
  siteMetadata,
  websiteSchema,
} from "@/lib/seo";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = siteMetadata({
  verification: googleVerification
    ? { google: googleVerification }
    : undefined,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${plusJakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        {children}
        <Analytics />
        <VercelAnalytics />
      </body>
    </html>
  );
}
