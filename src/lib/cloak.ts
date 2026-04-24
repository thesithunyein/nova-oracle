"use client";

import {
  CLOAK_PROGRAM_ID,
  NATIVE_SOL_MINT,
  createUtxo,
  createZeroUtxo,
  fullWithdraw,
  generateUtxoKeypair,
  getNkFromUtxoPrivateKey,
  partialWithdraw,
  transact,
  scanTransactions,
  toComplianceReport,
} from "@cloak.dev/sdk";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import type { TokenType } from "./types";
import { USDC_MINT, USDT_MINT, SOLANA_RPC_URL } from "./constants";

export function getConnection(): Connection {
  return new Connection(SOLANA_RPC_URL, "confirmed");
}

export function getMintForToken(token: TokenType): PublicKey {
  switch (token) {
    case "SOL":
      return NATIVE_SOL_MINT;
    case "USDC":
      return USDC_MINT;
    case "USDT":
      return USDT_MINT;
  }
}

export function getDecimalsForToken(token: TokenType): number {
  return token === "SOL" ? 9 : 6;
}

export function toBaseUnits(amount: number, token: TokenType): bigint {
  const decimals = getDecimalsForToken(token);
  return BigInt(Math.round(amount * 10 ** decimals));
}

export function fromBaseUnits(baseUnits: bigint, token: TokenType): number {
  const decimals = getDecimalsForToken(token);
  return Number(baseUnits) / 10 ** decimals;
}

export interface CloakKeys {
  scanKeypair: Awaited<ReturnType<typeof generateUtxoKeypair>>;
  viewingKeyNk: Uint8Array;
}

export async function initializeCloakKeys(): Promise<CloakKeys> {
  const scanKeypair = await generateUtxoKeypair();
  const viewingKeyNk = getNkFromUtxoPrivateKey(scanKeypair.privateKey);
  return { scanKeypair, viewingKeyNk };
}

export function buildBaseOptions(
  signer: Keypair,
  viewingKeyNk: Uint8Array,
  connection?: Connection
) {
  const conn = connection || getConnection();
  return {
    connection: conn,
    programId: CLOAK_PROGRAM_ID,
    depositorKeypair: signer,
    walletPublicKey: signer.publicKey,
    chainNoteViewingKeyNk: viewingKeyNk,
  };
}

export async function shieldedSend(args: {
  mint: PublicKey;
  amount: bigint;
  recipientWallet: PublicKey;
  signer: Keypair;
  viewingKeyNk: Uint8Array;
  connection?: Connection;
}): Promise<{ signature: string }> {
  const baseOptions = buildBaseOptions(
    args.signer,
    args.viewingKeyNk,
    args.connection
  );

  const owner = await generateUtxoKeypair();
  const output = await createUtxo(args.amount, owner, args.mint);

  const deposited = await transact(
    {
      inputUtxos: [await createZeroUtxo(args.mint)],
      outputUtxos: [output],
      externalAmount: args.amount,
      depositor: args.signer.publicKey,
    },
    baseOptions
  );

  const result = await fullWithdraw(
    deposited.outputUtxos,
    args.recipientWallet,
    {
      ...baseOptions,
      cachedMerkleTree: deposited.merkleTree,
    }
  );

  return { signature: result.signature };
}

export async function executePayrollBatch(args: {
  recipients: Array<{ wallet: PublicKey; amount: bigint }>;
  mint: PublicKey;
  signer: Keypair;
  viewingKeyNk: Uint8Array;
  connection?: Connection;
  onProgress?: (index: number, total: number, signature?: string) => void;
}): Promise<Array<{ wallet: string; signature: string; error?: string }>> {
  const results: Array<{ wallet: string; signature: string; error?: string }> = [];

  for (let i = 0; i < args.recipients.length; i++) {
    const payment = args.recipients[i];
    args.onProgress?.(i, args.recipients.length);

    try {
      const { signature } = await shieldedSend({
        mint: args.mint,
        amount: payment.amount,
        recipientWallet: payment.wallet,
        signer: args.signer,
        viewingKeyNk: args.viewingKeyNk,
        connection: args.connection,
      });

      results.push({
        wallet: payment.wallet.toBase58(),
        signature,
      });

      args.onProgress?.(i + 1, args.recipients.length, signature);
    } catch (error) {
      results.push({
        wallet: payment.wallet.toBase58(),
        signature: "",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

export async function scanHistory(viewingKeyNk: Uint8Array, limit = 250) {
  const connection = getConnection();
  const scan = await scanTransactions({
    connection,
    programId: CLOAK_PROGRAM_ID,
    viewingKeyNk,
    limit,
  });
  return toComplianceReport(scan);
}

export async function depositToShieldedPool(args: {
  amount: bigint;
  mint: PublicKey;
  signer: Keypair;
  viewingKeyNk: Uint8Array;
  connection?: Connection;
}) {
  const baseOptions = buildBaseOptions(
    args.signer,
    args.viewingKeyNk,
    args.connection
  );

  const owner = await generateUtxoKeypair();
  const output = await createUtxo(args.amount, owner, args.mint);

  const deposited = await transact(
    {
      inputUtxos: [await createZeroUtxo(args.mint)],
      outputUtxos: [output],
      externalAmount: args.amount,
      depositor: args.signer.publicKey,
    },
    baseOptions
  );

  return {
    signature: deposited.signature || "",
    outputUtxos: deposited.outputUtxos,
    merkleTree: deposited.merkleTree,
  };
}

export async function withdrawFromPool(args: {
  outputUtxos: any[];
  recipientWallet: PublicKey;
  signer: Keypair;
  viewingKeyNk: Uint8Array;
  merkleTree: any;
  amount?: bigint;
  connection?: Connection;
}) {
  const baseOptions = buildBaseOptions(
    args.signer,
    args.viewingKeyNk,
    args.connection
  );

  if (args.amount) {
    return partialWithdraw(args.outputUtxos, args.recipientWallet, args.amount, {
      ...baseOptions,
      cachedMerkleTree: args.merkleTree,
    });
  }

  return fullWithdraw(args.outputUtxos, args.recipientWallet, {
    ...baseOptions,
    cachedMerkleTree: args.merkleTree,
  });
}
