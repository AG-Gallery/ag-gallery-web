import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import localFont from "next/font/local";

import Footer from "@/components/footer";
import Header from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pretendard = localFont({
  src: "../fonts/pretendard-variable.woff2",
  variable: "--font-pretendard",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AG Gallery",
  description:
    "AG Gallery is an art gallery located in Glendale, California. We represent a diverse group of artists through physical and online exhibitions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pretendard.variable} antialiased`}
      >
        <div className="mx-3 mt-24 flex min-h-screen flex-col md:mx-10">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
