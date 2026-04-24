import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatSOL(lamports: bigint): string {
  const sol = Number(lamports) / 1e9;
  return sol.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export function formatUSDC(baseUnits: bigint): string {
  const usdc = Number(baseUnits) / 1e6;
  return usdc.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function lamportsToSOL(lamports: number | bigint): number {
  return Number(lamports) / 1e9;
}

export function solToLamports(sol: number): bigint {
  return BigInt(Math.round(sol * 1e9));
}

export function usdcToBaseUnits(usdc: number): bigint {
  return BigInt(Math.round(usdc * 1e6));
}

export function generateClaimId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
