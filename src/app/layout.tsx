import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WHO MADE THIS TRAIL",
  description: "인천드림교회 70주년 팝업플레이스 디지털 도장판",
  manifest: "/manifest.json",
  // Without this iOS keeps the status bar as an opaque band above the web view
  // and the artwork stops short of the top of the screen. Translucent hands us
  // the whole screen; the safe-area insets keep the controls clear of the clock.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WHO MADE THIS TRAIL",
  },
  // `capable` above only emits the modern `mobile-web-app-capable`, and iOS has
  // historically read the status bar style only alongside Apple's own spelling.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: "#171512",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // The artwork paints all the way into the safe areas so the app fills the
  // screen; controls keep clear of them with the --safe-* insets instead.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${inter.variable} h-full`}>
      <body className="flex h-full min-h-dvh flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
