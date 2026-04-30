import type { Metadata } from "next";
import { PwaRegister } from "@/components/PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "CalcLine Web",
  title: "CalcLine Web",
  description: "Microwave line calculator migrated from CalcLine2024.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "CalcLine Web",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/calcline-icon.svg",
    apple: "/icons/calcline-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
