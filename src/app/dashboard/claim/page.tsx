"use client";

import React, { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Link2,
  Shield,
  Loader2,
  Copy,
  ExternalLink,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { SOLSCAN_TX } from "@/lib/constants";

// Encode/decode escrow secret key in URL-safe base64
function encodeSecret(secretKey: Uint8Array): string {
  const b64 = btoa(String.fromCharCode(...secretKey));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export default function ClaimGeneratePage() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { addTransaction } = useAppStore();

  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<{
    url: string;
    amount: string;
    memo: string;
    fundingSig: string;
    escrowAddress: string;
  } | null>(null);

  const isValid = parseFloat(amount) > 0 && parseFloat(amount) <= 1;

  const handleGenerate = async () => {
    if (!publicKey || !isValid || !signTransaction) return;
    setIsGenerating(true);
    setGeneratedLink(null);

    try {
      // Step 1 — Generate fresh stealth keypair (escrow)
      toast.info("Generating stealth address...");
      const escrow = Keypair.generate();
      const lamports = Math.round(parseFloat(amount) * LAMPORTS_PER_SOL);

      // Step 2 — Fund the escrow with one wallet approval
      toast.info("Approve funding tx in your wallet...");
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized");
      const tx = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: escrow.publicKey,
          lamports,
        })
      );
      const signed = await signTransaction(tx);
      toast.info("Submitting...");
      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
        maxRetries: 5,
      });

      // Step 3 — Wait for confirmation
      toast.info("Confirming on devnet...");
      let confirmed = false;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const status = await connection.getSignatureStatus(signature);
        if (status.value?.err) throw new Error("Funding tx failed");
        if (
          status.value?.confirmationStatus === "confirmed" ||
          status.value?.confirmationStatus === "finalized"
        ) {
          confirmed = true;
          break;
        }
      }
      if (!confirmed) throw new Error("Funding tx not confirmed in 30s");

      // Step 4 — Encode escrow secret key as URL-safe link
      const encoded = encodeSecret(escrow.secretKey);
      const memoEncoded = encodeURIComponent(memo);
      const url = `${window.location.origin}/claim/${encoded}${memo ? `?m=${memoEncoded}` : ""}`;

      addTransaction({
        id: crypto.randomUUID(),
        type: "send",
        amount: parseFloat(amount),
        token: "SOL",
        recipient: escrow.publicKey.toBase58(),
        txSignature: signature,
        timestamp: new Date(),
        status: "confirmed",
      });

      setGeneratedLink({
        url,
        amount,
        memo,
        fundingSig: signature,
        escrowAddress: escrow.publicKey.toBase58(),
      });

      toast.success("Claim link ready — share with anyone");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed: " + msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink.url);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          Stealth Claim Links
        </h1>
        <p className="text-muted-foreground mt-1">
          Send funds without knowing the recipient&apos;s address. Generate a link, share it
          anywhere — whoever opens it claims the funds.
        </p>
      </div>

      {!publicKey && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="py-6">
            <p className="text-sm text-yellow-200">
              Connect a wallet first to generate a claim link.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Generate a Claim Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Amount (SOL)</label>
            <Input
              type="number"
              placeholder="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              max="1"
              step="0.001"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Max 1 SOL per link on devnet. Funds are escrowed in a fresh stealth address.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Memo (optional)</label>
            <Input
              placeholder="Invoice #INV-2026-001"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              maxLength={80}
            />
          </div>

          <div className="rounded-lg bg-accent/40 border border-border p-4 text-xs text-muted-foreground space-y-1.5">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-primary" />
              How it works
            </p>
            <p>1. We generate a fresh keypair (the &quot;stealth address&quot;).</p>
            <p>2. You approve one transaction funding it with the amount above.</p>
            <p>3. We encode the keypair&apos;s private key into a URL-safe link.</p>
            <p>4. You share the link. Whoever opens it can sweep the funds to their wallet.</p>
            <p className="pt-1 italic">
              On Cloak mainnet, the same flow uses real stealth addresses — the link encodes a
              one-time receiving key tied to the shielded pool.
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!publicKey || !isValid || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate Claim Link
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedLink && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              Claim Link Ready
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Shareable link</p>
              <div className="flex items-stretch gap-2">
                <div className="flex-1 px-3 py-2 rounded-md bg-background border border-border font-mono text-xs break-all">
                  {generatedLink.url}
                </div>
                <Button onClick={copyLink} variant="outline" size="icon">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Amount escrowed</p>
                <p className="text-lg font-semibold">{generatedLink.amount} SOL</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stealth address</p>
                <p className="text-xs font-mono truncate">
                  {generatedLink.escrowAddress.slice(0, 10)}...
                  {generatedLink.escrowAddress.slice(-6)}
                </p>
              </div>
            </div>

            {generatedLink.memo && (
              <div>
                <p className="text-xs text-muted-foreground">Memo</p>
                <p className="text-sm">{generatedLink.memo}</p>
              </div>
            )}

            <a
              href={SOLSCAN_TX(generatedLink.fundingSig)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              View funding tx on Explorer <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="text-xs text-yellow-300/80 bg-yellow-500/5 border border-yellow-500/20 rounded-md p-3">
              ⚠️ Anyone with this link can claim the funds. Share it through a private channel
              (DM, email, encrypted messaging).
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
