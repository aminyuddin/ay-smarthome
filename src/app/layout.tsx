import type { Metadata } from "next";
import { HomeAssistantProvider } from "@/lib/context/HomeAssistantContext";
import { DashboardShell } from "@/components/layout/DashboardShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "AY Smart Home",
  description: "AY Smart Home – control your Home Assistant entities",
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
