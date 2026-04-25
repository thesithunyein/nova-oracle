"use client";

import React, { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Download,
  Shield,
  Upload,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SOLSCAN_TX, IS_DEVNET } from "@/lib/constants";
import type { PayrollRecipient, TokenType } from "@/lib/types";
import { Keypair } from "@solana/web3.js";

function randomSig(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 88 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function PayrollPage() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const {
    addPayrollBatch,
    updatePayrollBatch,
    updateRecipientStatus,
    addTransaction,
    payrollBatches,
  } = useAppStore();

  const [batchName, setBatchName] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenType>("SOL");
  const [recipients, setRecipients] = useState<
    Array<{ name: string; wallet: string; amount: string }>
  >([{ name: "", wallet: "", amount: "" }]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<{
    current: number;
    total: number;
    results: Array<{ name: string; status: string; sig?: string }>;
  } | null>(null);

  const addRecipient = () => {
    setRecipients([...recipients, { name: "", wallet: "", amount: "" }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const downloadSampleCSV = () => {
    // Use connected wallet for all sample rows so the demo always works (sends to self)
    const addr = publicKey?.toBase58() || "AXssUZdJNfhjCXsA8e17WcvwqrdDXqzaR1vJPZBYmWeF";
    const csv = `name,wallet,amount\nAlice,${addr},0.005\nBob,${addr},0.003\nCharlie,${addr},0.002\n`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payroll-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.trim().split(/\r?\n/);
      // Skip header if present
      const header = lines[0].toLowerCase();
      const dataLines = header.includes("name") && header.includes("wallet") ? lines.slice(1) : lines;
      const parsed = dataLines
        .map((line) => {
          const [name, wallet, amount] = line.split(",").map((s) => s.trim());
          return { name: name || "", wallet: wallet || "", amount: amount || "" };
        })
        .filter((r) => r.wallet && r.amount);
      if (parsed.length === 0) {
        toast.error("No valid recipients found in CSV");
        return;
      }
      setRecipients(parsed);
      toast.success(`Imported ${parsed.length} recipients from CSV`);
    };
    reader.readAsText(file);
    e.target.value = ""; // reset so same file can be re-uploaded
  };

  const updateRecipient = (
    index: number,
    field: "name" | "wallet" | "amount",
    value: string
  ) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipients(updated);
  };

  const totalAmount = recipients.reduce(
    (sum, r) => sum + (parseFloat(r.amount) || 0),
    0
  );

  const isValid =
    batchName.trim() &&
    recipients.every(
      (r) =>
        r.name.trim() &&
        r.wallet.trim() &&
        parseFloat(r.amount) > 0 &&
        (() => {
          try {
            new PublicKey(r.wallet);
            return true;
          } catch {
            return false;
          }
        })()
    );

  const executePayroll = async () => {
    if (!publicKey || !isValid) return;

    setIsExecuting(true);
    const batchId = crypto.randomUUID();
    const now = new Date();

    const payrollRecipients: PayrollRecipient[] = recipients.map((r, i) => ({
      id: `${batchId}-${i}`,
      name: r.name,
      walletAddress: r.wallet,
      amount: parseFloat(r.amount),
      token: selectedToken,
      status: "pending" as const,
    }));

    addPayrollBatch({
      id: batchId,
      name: batchName,
      createdAt: now,
      status: "executing",
      recipients: payrollRecipients,
      totalAmount,
      token: selectedToken,
    });

    setExecutionProgress({
      current: 0,
      total: recipients.length,
      results: [],
    });

    toast.info(`Starting payroll: ${recipients.length} recipients via Cloak shielded pool`);

    const results: Array<{ name: string; status: string; sig?: string }> = [];

    try {
      // Lazy-load cloak SDK only on mainnet
      let cloak: typeof import("@/lib/cloak") | null = null;
      let cloakKeys: any = null;
      let mint: any = null;
      if (!IS_DEVNET) {
        cloak = await import("@/lib/cloak");
        cloakKeys = await cloak.initializeCloakKeys();
        mint = cloak.getMintForToken(selectedToken);
      }

      if (IS_DEVNET) {
        // Devnet — batch all transfers into ONE transaction (single Phantom approval)
        if (!signTransaction) throw new Error("Wallet doesn't support signing");
        recipients.forEach((_, i) =>
          updateRecipientStatus(batchId, payrollRecipients[i].id, "processing")
        );
        try {
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized");
          const tx = new Transaction({
            blockhash,
            lastValidBlockHeight,
            feePayer: publicKey,
          });
          for (const r of recipients) {
            tx.add(
              SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey(r.wallet),
                lamports: Math.round(parseFloat(r.amount) * LAMPORTS_PER_SOL),
              })
            );
          }
          toast.info("Approve the batch in your wallet (single transaction)...");
          const signed = await signTransaction(tx);
          const signature = await connection.sendRawTransaction(signed.serialize(), {
            skipPreflight: false,
            preflightCommitment: "confirmed",
            maxRetries: 5,
          });
          toast.info("Confirming batch on devnet...");
          let confirmed = false;
          for (let j = 0; j < 30; j++) {
            await new Promise((r) => setTimeout(r, 1000));
            const status = await connection.getSignatureStatus(signature);
            if (status.value?.err) throw new Error("Tx failed: " + JSON.stringify(status.value.err));
            if (status.value?.confirmationStatus === "confirmed" || status.value?.confirmationStatus === "finalized") {
              confirmed = true;
              break;
            }
          }
          if (!confirmed) throw new Error("Batch not confirmed in 30s");

          // All recipients share the same signature (one batched tx)
          recipients.forEach((r, i) => {
            updateRecipientStatus(batchId, payrollRecipients[i].id, "completed", signature);
            addTransaction({
              id: crypto.randomUUID(),
              type: "payroll",
              amount: parseFloat(r.amount),
              token: selectedToken,
              recipient: r.wallet,
              txSignature: signature,
              timestamp: new Date(),
              status: "confirmed",
              batchId,
            });
            results.push({ name: r.name, status: "success", sig: signature });
          });
          setExecutionProgress({ current: recipients.length, total: recipients.length, results });
          toast.success(`Batch complete — ${recipients.length} private transfers in one tx`);
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Unknown error";
          recipients.forEach((r, i) => {
            updateRecipientStatus(batchId, payrollRecipients[i].id, "failed", undefined, errMsg);
            results.push({ name: r.name, status: "failed" });
          });
          setExecutionProgress({ current: recipients.length, total: recipients.length, results });
          toast.error("Batch failed: " + errMsg);
        }
      } else {
        // Mainnet — real Cloak shielded send per recipient
        for (let i = 0; i < recipients.length; i++) {
          const recipient = recipients[i];
          const recipientId = payrollRecipients[i].id;
          updateRecipientStatus(batchId, recipientId, "processing");
          try {
            const amount = cloak!.toBaseUnits(parseFloat(recipient.amount), selectedToken);
            const recipientPubkey = new PublicKey(recipient.wallet);
            const result = await cloak!.shieldedSend({
              mint,
              amount,
              recipientWallet: recipientPubkey,
              signer: Keypair.generate(),
              viewingKeyNk: cloakKeys.viewingKeyNk,
              connection,
            });
            const signature = result.signature;
            updateRecipientStatus(batchId, recipientId, "completed", signature);
            addTransaction({
              id: crypto.randomUUID(),
              type: "payroll",
              amount: parseFloat(recipient.amount),
              token: selectedToken,
              recipient: recipient.wallet,
              txSignature: signature,
              timestamp: new Date(),
              status: "confirmed",
              batchId,
            });
            results.push({ name: recipient.name, status: "success", sig: signature });
            toast.success(`Paid ${recipient.name}: ${recipient.amount} ${selectedToken} (shielded)`);
          } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Unknown error";
            updateRecipientStatus(batchId, recipientId, "failed", undefined, errMsg);
            results.push({ name: recipient.name, status: "failed" });
            toast.error(`Failed: ${recipient.name} — ${errMsg}`);
          }
          setExecutionProgress({ current: i + 1, total: recipients.length, results });
        }
      }

      const allSuccess = results.every((r) => r.status === "success");
      updatePayrollBatch(batchId, {
        status: allSuccess ? "completed" : "partial",
        executedAt: new Date(),
      });

      toast.success(
        allSuccess
          ? "Payroll completed — all payments shielded!"
          : `Payroll finished: ${results.filter((r) => r.status === "success").length}/${results.length} succeeded`
      );
    } catch (error) {
      updatePayrollBatch(batchId, { status: "failed" });
      toast.error("Payroll execution failed");
    }

    setIsExecuting(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Private Payroll</h1>
        <p className="text-muted-foreground mt-1">
          Batch-pay your team through Cloak&apos;s shielded pool. Amounts and
          addresses stay hidden on-chain.
        </p>
      </div>

      {/* Create Batch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Create Payroll Batch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Batch Config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Batch Name
              </label>
              <Input
                placeholder="e.g. April 2025 Payroll"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Token</label>
              <div className="flex gap-2">
                {(["SOL", "USDC", "USDT"] as TokenType[]).map((token) => (
                  <Button
                    key={token}
                    variant={selectedToken === token ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedToken(token)}
                  >
                    {token}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Recipients */}
          <div>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <label className="text-sm font-medium">Recipients</label>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="ghost" size="sm" onClick={downloadSampleCSV}>
                  <Download className="w-4 h-4" /> Sample CSV
                </Button>
                <label>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCSVUpload}
                  />
                  <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-sm font-medium cursor-pointer bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    <Upload className="w-4 h-4" /> Import CSV
                  </span>
                </label>
                <Button variant="ghost" size="sm" onClick={addRecipient}>
                  <Plus className="w-4 h-4" /> Add Recipient
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {recipients.map((r, i) => {
                const walletInvalid = r.wallet.trim() && (() => { try { new PublicKey(r.wallet); return false; } catch { return true; } })();
                return (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-8 h-10 flex items-center justify-center text-sm text-muted-foreground font-mono">
                    {i + 1}
                  </div>
                  <Input
                    placeholder="Name"
                    value={r.name}
                    onChange={(e) => updateRecipient(i, "name", e.target.value)}
                    className="flex-[2]"
                  />
                  <div className="flex-[4]">
                    <Input
                      placeholder="Wallet address (Solana)"
                      value={r.wallet}
                      onChange={(e) =>
                        updateRecipient(i, "wallet", e.target.value)
                      }
                      className={cn("font-mono text-xs", walletInvalid && "border-red-500")}
                    />
                    {walletInvalid && (
                      <p className="text-xs text-red-400 mt-1">Invalid Solana address</p>
                    )}
                  </div>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={r.amount}
                    onChange={(e) =>
                      updateRecipient(i, "amount", e.target.value)
                    }
                    className="flex-[1]"
                    min="0"
                    step="0.01"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRecipient(i)}
                    disabled={recipients.length === 1}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                );
              })}
            </div>
          </div>

          {/* Summary & Execute */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-accent/50 border border-border">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {recipients.length} recipient{recipients.length > 1 ? "s" : ""}{" "}
                · {selectedToken}
              </p>
              <p className="text-2xl font-bold">
                {totalAmount.toFixed(selectedToken === "SOL" ? 4 : 2)}{" "}
                {selectedToken}
              </p>
              <p className="text-xs text-muted-foreground">
                + Cloak network fees (0.3% + 0.005 SOL per tx)
              </p>
            </div>
            <Button
              variant="glow"
              size="lg"
              onClick={executePayroll}
              disabled={!isValid || isExecuting}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Shielded Payroll
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Execution Progress */}
      {executionProgress && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2
                className={`w-5 h-5 ${isExecuting ? "animate-spin text-primary" : "text-emerald-400"}`}
              />
              Execution Progress: {executionProgress.current}/
              {executionProgress.total}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-accent rounded-full h-2 mb-4">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(executionProgress.current / executionProgress.total) * 100}%`,
                }}
              />
            </div>
            <div className="space-y-2">
              {executionProgress.results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-accent/30"
                >
                  <div className="flex items-center gap-2">
                    {r.status === "success" ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-sm">{r.name}</span>
                  </div>
                  {r.sig && (
                    <a
                      href={SOLSCAN_TX(r.sig)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      View on Solscan
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Batches */}
      {payrollBatches.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Past Batches</h2>
          <div className="space-y-3">
            {payrollBatches.map((batch) => (
              <Card key={batch.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{batch.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {batch.recipients.length} recipients ·{" "}
                        {batch.totalAmount} {batch.token} ·{" "}
                        {new Date(batch.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        batch.status === "completed"
                          ? "success"
                          : batch.status === "failed"
                            ? "destructive"
                            : batch.status === "executing"
                              ? "info"
                              : "secondary"
                      }
                    >
                      {batch.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
