import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import "./globals.css";
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});
export const metadata: Metadata = {
  title: {
    default: "Studback — A little curiosity goes a long way",
    template: "%s · Studback",
  },
  description:
    "Watch, create, and connect. A home for your videos and the conversations around them.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
