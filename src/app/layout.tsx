import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WHO MADE THIS TRAIL — 70주년 팝업플레이스",
  description: "인천드림교회 70주년 팝업플레이스 디지털 도장판",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#171512",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
