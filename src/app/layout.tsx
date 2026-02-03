import type { Metadata, Viewport } from "next";
import { HomeAssistantProvider } from "@/lib/context/HomeAssistantContext";
import { DashboardShell } from "@/components/layout/DashboardShell";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ay-smarthome.web.app";

export const metadata: Metadata = {
  title: "AY Smart Home",
  description: "AY Smart Home – control your Home Assistant entities",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "AY Smart Home",
    description: "AY Smart Home – control your Home Assistant entities",
    url: "/",
    siteName: "AY Smart Home",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AY Smart Home – Smart home dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AY Smart Home",
    description: "AY Smart Home – control your Home Assistant entities",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <HomeAssistantProvider>
          <DashboardShell>{children}</DashboardShell>
        </HomeAssistantProvider>
      </body>
    </html>
  );
}
