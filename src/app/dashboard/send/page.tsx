"use client";

import React, { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Keypair } from "@solana/web3.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Shield,
  Loader2,
  CheckCircle,
  ExternalLink,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { SOLSCAN_TX } from "@/lib/constants";
import type { TokenType } from "@/lib/types";
import {
  shieldedSend,
  getMintForToken,
  toBaseUnits,
  initializeCloakKeys,
} from "@/lib/cloak";

export default function SendPage() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { addTransaction } = useAppStore();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenType>("SOL");
  const [isSending, setIsSending] = useState(false);
  const [txResult, setTxResult] = useState<{
    signature: string;
    amount: string;
    token: TokenType;
    recipient: string;
  } | null>(null);

  const isValidAddress = (() => {
    try {
      if (!recipient) return false;
      new PublicKey(recipient);
      return true;
    } catch {
      return false;
    }
  })();

  const isValid = isValidAddress && parseFloat(amount) > 0;

  const handleSend = async () => {
    if (!publicKey || !isValid) return;

    setIsSending(true);
    setTxResult(null);

    try {
      toast.info("Initiating shielded transfer via Cloak SDK...");

      const cloakKeys = await initializeCloakKeys();
      const mint = getMintForToken(selectedToken);
      const amountBase = toBaseUnits(parseFloat(amount), selectedToken);

      const { signature } = await shieldedSend({
        mint,
        amount: amountBase,
        recipientWallet: new PublicKey(recipient),
        signer: Keypair.generate(),
        viewingKeyNk: cloakKeys.viewingKeyNk,
        connection,
      });

      setTxResult({
        signature,
        amount,
        token: selectedToken,
        recipient,
      });

      addTransaction({
        id: crypto.randomUUID(),
        type: "send",
        amount: parseFloat(amount),
        token: selectedToken,
        recipient,
        txSignature: signature,
        timestamp: new Date(),
        status: "confirmed",
      });

      toast.success("Private transfer completed!");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Transfer failed: ${errMsg}`);
    }

    setIsSending(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Private Send</h1>
        <p className="text-muted-foreground mt-1">
          Send SOL, USDC, or USDT privately through Cloak&apos;s shielded pool.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Shielded Transfer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Token Selection */}
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

          {/* Recipient */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Recipient Wallet Address
            </label>
            <Input
              placeholder="Solana wallet address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="font-mono text-sm"
            />
            {recipient && !isValidAddress && (
              <p className="text-xs text-destructive mt-1">
                Invalid Solana address
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Amount</label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {selectedToken}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Fee: 0.3% + 0.005 SOL (Cloak network fee)
            </p>
          </div>

          {/* Send Button */}
          <Button
            variant="glow"
            size="lg"
            className="w-full"
            onClick={handleSend}
            disabled={!isValid || isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating ZK proof & submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send {amount || "0"} {selectedToken} Privately
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Success Result */}
      {txResult && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-emerald-400 mt-0.5" />
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    Private Transfer Confirmed
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {txResult.amount} {txResult.token} sent through Cloak
                    shielded pool
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                    <span className="text-xs text-muted-foreground">
                      Transaction
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs">
                        {txResult.signature.slice(0, 16)}...
                      </code>
                      <button
                        onClick={() => copyToClipboard(txResult.signature)}
                      >
                        <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                      </button>
                      <a
                        href={SOLSCAN_TX(txResult.signature)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3 h-3 text-primary" />
                      </a>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The on-chain transaction reveals nothing about the amount or
                    recipient. Only viewing key holders can decrypt the details.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
