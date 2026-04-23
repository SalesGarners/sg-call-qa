import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

import NextAuthProvider from "@/components/NextAuthProvider";

export const metadata: Metadata = {
  title: "AI Call Quality Analyzer | SalesGarners",
  description: "Industry-standard AI-powered call analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>
          <Navbar />
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
