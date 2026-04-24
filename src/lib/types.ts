export type TokenType = "SOL" | "USDC" | "USDT";

export interface PayrollRecipient {
  id: string;
  name: string;
  walletAddress: string;
  amount: number;
  token: TokenType;
  status: "pending" | "processing" | "completed" | "failed";
  txSignature?: string;
  error?: string;
}

export interface PayrollBatch {
  id: string;
  name: string;
  createdAt: Date;
  executedAt?: Date;
  status: "draft" | "executing" | "completed" | "partial" | "failed";
  recipients: PayrollRecipient[];
  totalAmount: number;
  token: TokenType;
  viewingKeyNk?: string;
}

export interface TransactionRecord {
  id: string;
  type: "deposit" | "withdraw" | "send" | "payroll" | "swap";
  amount: number;
  token: TokenType;
  recipient?: string;
  txSignature: string;
  timestamp: Date;
  status: "confirmed" | "pending" | "failed";
  fee?: number;
  netAmount?: number;
  batchId?: string;
}

export interface ViewingKey {
  id: string;
  label: string;
  nk: string;
  createdAt: Date;
  scope: "full" | "audit" | "time-limited";
  expiresAt?: Date;
  isActive: boolean;
}

export interface ComplianceReport {
  summary: {
    totalTransactions: number;
    totalDeposited: number;
    totalWithdrawn: number;
    totalFees: number;
    netBalance: number;
  };
  transactions: TransactionRecord[];
  generatedAt: Date;
  viewingKeyLabel: string;
}

export interface ClaimLink {
  id: string;
  amount: number;
  token: TokenType;
  createdAt: Date;
  expiresAt: Date;
  claimed: boolean;
  claimedBy?: string;
  claimedAt?: Date;
  senderWallet: string;
}

export interface ShieldedBalance {
  sol: bigint;
  usdc: bigint;
  usdt: bigint;
}
