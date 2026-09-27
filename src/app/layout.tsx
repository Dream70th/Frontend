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
  // Not black-translucent. That style lifts the web view's origin up under the
  // status bar without growing it, so the view stays screen-minus-status-bar
  // tall and the bottom 62pt of the screen is simply not part of it — measured
  // on an iPhone 16 Pro, a band no CSS could paint into, however the box was
  // sized. iOS gives a home-screen app the screen minus the status bar either
  // way; the only choice is where that goes. Above the app, carrying the clock,
  // it reads as an ordinary iOS status bar. Below it, it is a dead black strip.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
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
    <html lang="ko" className={inter.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
