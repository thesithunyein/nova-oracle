import { PublicKey } from "@solana/web3.js";

export const NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet") as "devnet" | "mainnet-beta";
export const IS_DEVNET = NETWORK !== "mainnet-beta";

export const CLOAK_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_CLOAK_PROGRAM_ID || "zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW"
);

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || (IS_DEVNET
    ? "https://rpc.ankr.com/solana_devnet"
    : "https://api.mainnet-beta.solana.com");

export const CLOAK_RELAY_URL =
  process.env.NEXT_PUBLIC_CLOAK_RELAY_URL || "https://api.cloak.ag";

export const USDC_MINT = new PublicKey(
  IS_DEVNET
    ? "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
    : "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);

export const USDT_MINT = new PublicKey(
  IS_DEVNET
    ? "EJwZgeZrdC8TXTQbQBoL6bfuAnFUQYtEnrNRrVe7FKCr"
    : "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
);

export const NATIVE_SOL_MINT_ADDRESS = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

export const CLOAK_PROGRAM = CLOAK_PROGRAM_ID;
export const NATIVE_SOL_MINT_PK = NATIVE_SOL_MINT_ADDRESS;

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

export const EXPLORER_BASE = IS_DEVNET
  ? "https://explorer.solana.com"
  : "https://solscan.io";
export const SOLSCAN_TX = (sig: string) =>
  IS_DEVNET
    ? `${EXPLORER_BASE}/tx/${sig}?cluster=devnet`
    : `${EXPLORER_BASE}/tx/${sig}`;
export const SOLSCAN_ACCOUNT = (addr: string) =>
  IS_DEVNET
    ? `${EXPLORER_BASE}/address/${addr}?cluster=devnet`
    : `${EXPLORER_BASE}/account/${addr}`;
