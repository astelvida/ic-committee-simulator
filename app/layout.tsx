import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Fonts map onto the prototype's --disp / --sans / --mono CSS variables so the
// ported inline styles reference them unchanged.
const display = Space_Grotesk({
  variable: "--disp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  fallback: ["sans-serif"],
  display: "swap",
});

const sans = IBM_Plex_Sans({
  variable: "--sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  fallback: ["system-ui", "sans-serif"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  fallback: ["ui-monospace", "monospace"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Adversarial IC — the investment committee, simulated",
  description:
    "You're the analyst. Defend your investment case, live, against four AI committee partners. No fabricated numbers — just the thesis, under load.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
