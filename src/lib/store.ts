"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  PayrollBatch,
  PayrollRecipient,
  TransactionRecord,
  ViewingKey,
  ClaimLink,
  TokenType,
} from "./types";

interface AppState {
  payrollBatches: PayrollBatch[];
  transactions: TransactionRecord[];
  viewingKeys: ViewingKey[];
  claimLinks: ClaimLink[];
  shieldedBalances: { sol: number; usdc: number; usdt: number };

  addPayrollBatch: (batch: PayrollBatch) => void;
  updatePayrollBatch: (id: string, updates: Partial<PayrollBatch>) => void;
  updateRecipientStatus: (
    batchId: string,
    recipientId: string,
    status: PayrollRecipient["status"],
    txSignature?: string,
    error?: string
  ) => void;
  removePayrollBatch: (id: string) => void;

  addTransaction: (tx: TransactionRecord) => void;
  addViewingKey: (key: ViewingKey) => void;
  removeViewingKey: (id: string) => void;

  addClaimLink: (link: ClaimLink) => void;
  updateClaimLink: (id: string, updates: Partial<ClaimLink>) => void;

  setShieldedBalances: (balances: { sol: number; usdc: number; usdt: number }) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      payrollBatches: [],
      transactions: [],
      viewingKeys: [],
      claimLinks: [],
      shieldedBalances: { sol: 0, usdc: 0, usdt: 0 },

      addPayrollBatch: (batch) =>
        set((state) => ({
          payrollBatches: [batch, ...state.payrollBatches],
        })),

      updatePayrollBatch: (id, updates) =>
        set((state) => ({
          payrollBatches: state.payrollBatches.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        })),

      updateRecipientStatus: (batchId, recipientId, status, txSignature, error) =>
        set((state) => ({
          payrollBatches: state.payrollBatches.map((b) =>
            b.id === batchId
              ? {
                  ...b,
                  recipients: b.recipients.map((r) =>
                    r.id === recipientId
                      ? { ...r, status, txSignature, error }
                      : r
                  ),
                }
              : b
          ),
        })),

      removePayrollBatch: (id) =>
        set((state) => ({
          payrollBatches: state.payrollBatches.filter((b) => b.id !== id),
        })),

      addTransaction: (tx) =>
        set((state) => ({
          transactions: [tx, ...state.transactions],
        })),

      addViewingKey: (key) =>
        set((state) => ({
          viewingKeys: [key, ...state.viewingKeys],
        })),

      removeViewingKey: (id) =>
        set((state) => ({
          viewingKeys: state.viewingKeys.filter((k) => k.id !== id),
        })),

      addClaimLink: (link) =>
        set((state) => ({
          claimLinks: [link, ...state.claimLinks],
        })),

      updateClaimLink: (id, updates) =>
        set((state) => ({
          claimLinks: state.claimLinks.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        })),

      setShieldedBalances: (balances) =>
        set(() => ({ shieldedBalances: balances })),
    }),
    {
      name: "nova-oracle-store",
    }
  )
);
