import type { Metadata } from "next";
import "./globals.css";
import WalletBar from "@/components/WalletBar";
import { WalletProviderWrapper } from "@/context/WalletContext";

export const metadata: Metadata = {
  title: "MicroPoll - Sybil-Resistant Paid Opinion Platform",
  description: "Build on Stellar Soroban - Create polls, vote, and earn rewards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <WalletProviderWrapper>
          <WalletBar />
          <main className="max-w-7xl mx-auto px-4 py-8">
            {children}
          </main>
        </WalletProviderWrapper>
      </body>
    </html>
  );
}
