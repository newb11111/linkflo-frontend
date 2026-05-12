import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "../lib/config";
import { TranslateProvider } from "../components/TranslateProvider";
import RouteInteractionReset from "../components/RouteInteractionReset";
import GlobalUiTranslator from "../components/GlobalUiTranslator";

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: "LinkFlo",
  description: "LinkFlo landing page system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="min-h-full flex flex-col"><TranslateProvider><RouteInteractionReset /><GlobalUiTranslator />{children}</TranslateProvider></body>
    </html>
  );
}
