import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import { NextAuthProvider } from "@/app/providers";

export const metadata: Metadata = {
  title: "ANOTHER OFFICE",
  description: "Fashion E-commerce",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <NextAuthProvider>
          <Providers>{children}</Providers>
        </NextAuthProvider>
      </body>
    </html>
  );
}
