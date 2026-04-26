"use client";

import React, { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useParams, useSearchParams } from "next/navigation";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Gift,
  Loader2,
  CheckCircle,
  ExternalLink,
  Shield,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { SOLSCAN_TX, IS_DEVNET } from "@/lib/constants";
import { NovaLogoFull } from "@/components/ui/nova-logo";
import Link from "next/link";

// Decode URL-safe base64 back to Uint8Array
function decodeSecret(encoded: string): Uint8Array {
  const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export default function ClaimPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const [escrow, setEscrow] = useState<Keypair | null>(null);
  const [escrowError, setEscrowError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<{
    signature: string;
    amount: number;
  } | null>(null);

  const memo = searchParams?.get("m") ? decodeURIComponent(searchParams.get("m")!) : "";

  useEffect(() => {
    try {
      const secret = params?.secret as string;
      if (!secret) throw new Error("No secret in URL");
      const secretKey = decodeSecret(secret);
      if (secretKey.length !== 64) throw new Error("Invalid stealth key");
      const kp = Keypair.fromSecretKey(secretKey);
      setEscrow(kp);
    } catch (e) {
      setEscrowError(e instanceof Error ? e.message : "Invalid claim link");
    }
  }, [params]);

  useEffect(() => {
    if (!escrow) return;
    let cancelled = false;
    const fetchBalance = async () => {
      try {
        const lamports = await connection.getBalance(escrow.publicKey, "confirmed");
        if (!cancelled) setBalance(lamports / LAMPORTS_PER_SOL);
      } catch (e) {
        if (!cancelled) setBalance(0);
      }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [escrow, connection]);

  const handleClaim = async () => {
    if (!escrow || !publicKey || !balance || balance <= 0) return;
    setIsClaiming(true);

    try {
      // Reserve fee + rent — leave a tiny buffer for tx fee (5000 lamports)
      const totalLamports = await connection.getBalance(escrow.publicKey, "confirmed");
      const TX_FEE_BUFFER = 5_000;
      const lamportsToSend = totalLamports - TX_FEE_BUFFER;
      if (lamportsToSend <= 0) throw new Error("Insufficient balance to cover tx fee");

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized");
      const tx = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: escrow.publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: escrow.publicKey,
          toPubkey: publicKey,
          lamports: lamportsToSend,
        })
      );

      // Sign with the escrow keypair (we have full custody via the URL)
      tx.sign(escrow);
      toast.info("Submitting claim...");
      const signature = await connection.sendRawTransaction(tx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
        maxRetries: 5,
      });

      toast.info("Confirming...");
      let confirmed = false;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const status = await connection.getSignatureStatus(signature);
        if (status.value?.err) throw new Error("Tx failed");
        if (
          status.value?.confirmationStatus === "confirmed" ||
          status.value?.confirmationStatus === "finalized"
        ) {
          confirmed = true;
          break;
        }
      }
      if (!confirmed) throw new Error("Tx not confirmed in 30s");

      setClaimResult({
        signature,
        amount: lamportsToSend / LAMPORTS_PER_SOL,
      });
      toast.success("Funds claimed successfully!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error("Claim failed: " + msg);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <NovaLogoFull size={28} />
          </Link>
          <div className="text-xs text-muted-foreground">Stealth Claim · {IS_DEVNET ? "Devnet" : "Mainnet"}</div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {escrowError && (
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="py-8 text-center space-y-3">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                <h2 className="text-xl font-semibold">Invalid Claim Link</h2>
                <p className="text-sm text-muted-foreground">{escrowError}</p>
              </CardContent>
            </Card>
          )}

          {!escrowError && claimResult && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="py-8 text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
                <h2 className="text-2xl font-semibold">Claim Successful</h2>
                <p className="text-lg">
                  <span className="font-bold">{claimResult.amount.toFixed(6)} SOL</span> sent to your wallet
                </p>
                <a
                  href={SOLSCAN_TX(claimResult.signature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  View transaction on Explorer <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <div className="pt-4">
                  <Link href="/">
                    <Button variant="outline" size="sm">
                      Explore NovaPay
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {!escrowError && !claimResult && escrow && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-6 h-6 text-primary" />
                  Funds Awaiting Claim
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-6 rounded-xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-2">Available to claim</p>
                  <p className="text-4xl font-bold">
                    {balance === null ? (
                      <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                    ) : (
                      `${balance.toFixed(6)} SOL`
                    )}
                  </p>
                </div>

                {memo && (
                  <div className="px-4 py-3 rounded-lg bg-accent/40 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Memo</p>
                    <p className="text-sm">{memo}</p>
                  </div>
                )}

                <div className="rounded-lg bg-accent/30 border border-border p-4 text-xs text-muted-foreground space-y-1.5">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    How stealth claim works
                  </p>
                  <p>The sender funded a fresh keypair (stealth address) and shared its private key with you via this URL.</p>
                  <p>Connect your wallet below — claiming sweeps the entire balance to your address in one transaction.</p>
                  <p>The sender never saw your wallet address. The chain never linked sender to recipient.</p>
                </div>

                {!connected ? (
                  <div className="flex justify-center">
                    <WalletMultiButton />
                  </div>
                ) : (
                  <Button
                    onClick={handleClaim}
                    disabled={isClaiming || !balance || balance <= 0}
                    size="lg"
                    className="w-full"
                  >
                    {isClaiming ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Claiming...
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4" /> Claim {balance?.toFixed(6) || 0} SOL
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          <p className="text-center text-xs text-muted-foreground mt-6">
            Powered by{" "}
            <Link href="/" className="text-primary hover:underline">
              NovaPay
            </Link>{" "}
            · Built on Cloak
          </p>
        </div>
      </div>
    </div>
  );
}
