import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "@/components/providers/wallet-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NovaPay — Private Payroll on Solana",
  description:
    "Private payroll and contractor payments on Solana. Pay your team in USDC, USDT, or SOL without exposing amounts or addresses on-chain. Powered by Cloak SDK.",
  keywords: [
    "private payroll",
    "solana",
    "cloak",
    "USDC",
    "private payments",
    "contractor payments",
    "shielded transactions",
  ],
  openGraph: {
    title: "NovaPay — Private Payroll on Solana",
    description:
      "Pay your team privately on Solana. Amounts hidden, addresses hidden, auditable only by viewing key holders.",
    url: "https://nova-oracle.xyz",
    siteName: "NovaPay",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NovaPay — Private Payroll on Solana",
    description:
      "Pay your team privately on Solana. Powered by Cloak SDK.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <SolanaWalletProvider>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            richColors
            closeButton
          />
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
