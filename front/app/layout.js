import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientAuthCheck from "@/components/ClientAuthCheck";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "POS System",
  description: "Point of Sale System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientAuthCheck>{children}</ClientAuthCheck>
      </body>
    </html>
  );
}
