import { PublicKey } from "@solana/web3.js";

export const CLOAK_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_CLOAK_PROGRAM_ID || "zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW"
);

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

export const CLOAK_RELAY_URL =
  process.env.NEXT_PUBLIC_CLOAK_RELAY_URL || "https://api.cloak.ag";

export const USDC_MINT = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);

export const USDT_MINT = new PublicKey(
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
);

export const NATIVE_SOL_MINT_ADDRESS = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

export const TOKEN_OPTIONS = [
  { label: "SOL", value: "SOL", decimals: 9, icon: "◎" },
  { label: "USDC", value: "USDC", decimals: 6, icon: "$" },
  { label: "USDT", value: "USDT", decimals: 6, icon: "₮" },
] as const;

export const FIXED_FEE_LAMPORTS = 5_000_000n;
export const VARIABLE_FEE_NUMERATOR = 3n;
export const VARIABLE_FEE_DENOMINATOR = 1000n;
export const MIN_DEPOSIT_LAMPORTS = 10_000_000n;

export function calculateFee(grossAmount: bigint): bigint {
  return FIXED_FEE_LAMPORTS + (grossAmount * VARIABLE_FEE_NUMERATOR) / VARIABLE_FEE_DENOMINATOR;
}

export function calculateNetAmount(grossAmount: bigint): bigint {
  return grossAmount - calculateFee(grossAmount);
}

export const SOLSCAN_BASE = "https://solscan.io";
export const SOLSCAN_TX = (sig: string) => `${SOLSCAN_BASE}/tx/${sig}`;
export const SOLSCAN_ACCOUNT = (addr: string) => `${SOLSCAN_BASE}/account/${addr}`;
