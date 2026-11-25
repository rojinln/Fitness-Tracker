import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bloom — Fitness Tracker",
  description: "A cute, local-first fitness & nutrition tracker.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Bloom", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#c79bff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="mx-auto min-h-screen max-w-app">{children}</div>
      </body>
    </html>
  );
}
