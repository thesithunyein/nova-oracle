"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Key,
  Plus,
  Copy,
  Shield,
  FileText,
  Loader2,
  Download,
  Trash2,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { IS_DEVNET } from "@/lib/constants";

function randomSig(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 88 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function CompliancePage() {
  const { viewingKeys, addViewingKey, removeViewingKey } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [keyLabel, setKeyLabel] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);

  const generateViewingKey = async () => {
    if (!keyLabel.trim()) {
      toast.error("Please enter a label for this viewing key");
      return;
    }

    setIsGenerating(true);
    try {
      let nkBytes: Uint8Array;

      if (IS_DEVNET) {
        nkBytes = new Uint8Array(32);
        crypto.getRandomValues(nkBytes);
      } else {
        const cloak = await import("@/lib/cloak");
        const cloakKeys = await cloak.initializeCloakKeys();
        nkBytes = cloakKeys.viewingKeyNk;
      }

      const nkHex = Array.from(nkBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      addViewingKey({
        id: crypto.randomUUID(),
        label: keyLabel,
        nk: nkHex,
        createdAt: new Date(),
        scope: "full",
        isActive: true,
      });

      toast.success(`Viewing key "${keyLabel}" generated`);
      setKeyLabel("");
    } catch (error) {
      toast.error("Failed to generate viewing key");
    }
    setIsGenerating(false);
  };

  const runComplianceScan = async (nkHex: string) => {
    setIsScanning(true);
    try {
      let report: any;

      if (IS_DEVNET) {
        // Demo mode — simulated chain-native scan results
        await new Promise((r) => setTimeout(r, 1500));
        report = {
          summary: {
            totalTransactions: 12,
            totalDeposits: 5,
            totalWithdrawals: 4,
            totalTransfers: 3,
            totalVolume: "45.2 SOL",
            dateRange: {
              from: new Date(Date.now() - 30 * 86400000).toISOString(),
              to: new Date().toISOString(),
            },
          },
          transactions: Array.from({ length: 5 }, (_, i) => ({
            signature: randomSig(),
            type: ["deposit", "withdrawal", "transfer"][i % 3],
            amount: (Math.random() * 5 + 0.1).toFixed(4),
            mint: "SOL",
            timestamp: new Date(Date.now() - i * 86400000).toISOString(),
          })),
        };
      } else {
        const nkBytes = new Uint8Array(
          nkHex.match(/.{2}/g)!.map((b) => parseInt(b, 16))
        );
        const cloak = await import("@/lib/cloak");
        report = await cloak.scanHistory(nkBytes);
      }

      setScanResult(report);
      toast.success("Compliance scan complete");
    } catch (error) {
      toast.error("Scan failed — ensure viewing key is registered on-chain");
    }
    setIsScanning(false);
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Viewing key copied to clipboard");
  };

  const exportReport = () => {
    if (!scanResult) return;
    const blob = new Blob([JSON.stringify(scanResult, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nova-compliance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Compliance & Audit</h1>
        <p className="text-muted-foreground mt-1">
          Manage viewing keys and generate compliance reports. Cloak&apos;s
          viewing key system lets you grant scoped access to auditors.
        </p>
      </div>

      {/* Generate Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Generate Viewing Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Viewing keys decrypt shielded transaction history. Issue a full key
            for internal finance, a scoped key for external auditors, or a
            time-limited key for regulators.
          </p>
          <div className="flex gap-3">
            <Input
              placeholder="Key label (e.g. Q1 2025 Audit)"
              value={keyLabel}
              onChange={(e) => setKeyLabel(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="glow"
              onClick={generateViewingKey}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Keys */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Active Viewing Keys ({viewingKeys.length})
        </h2>
        {viewingKeys.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No viewing keys yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Generate one above to enable audit trails
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {viewingKeys.map((key) => (
              <Card key={key.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{key.label}</h3>
                        <Badge variant="success">
                          {key.scope}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-accent px-2 py-1 rounded font-mono">
                          {key.nk.slice(0, 24)}...
                        </code>
                        <button onClick={() => copyKey(key.nk)}>
                          <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created {new Date(key.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runComplianceScan(key.nk)}
                        disabled={isScanning}
                      >
                        {isScanning ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                        Scan
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeViewingKey(key.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Scan Results */}
      {scanResult && (
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Compliance Report
              </CardTitle>
              <Button variant="outline" size="sm" onClick={exportReport}>
                <Download className="w-4 h-4" /> Export JSON
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: "Total Transactions",
                  value: scanResult.summary?.totalTransactions ?? "—",
                },
                {
                  label: "Total Deposited",
                  value: scanResult.summary?.totalDeposited
                    ? `${(scanResult.summary.totalDeposited / 1e9).toFixed(4)} SOL`
                    : "—",
                },
                {
                  label: "Total Withdrawn",
                  value: scanResult.summary?.totalWithdrawn
                    ? `${(scanResult.summary.totalWithdrawn / 1e9).toFixed(4)} SOL`
                    : "—",
                },
                {
                  label: "Total Fees",
                  value: scanResult.summary?.totalFees
                    ? `${(scanResult.summary.totalFees / 1e9).toFixed(6)} SOL`
                    : "—",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-3 rounded-lg bg-accent/50 text-center"
                >
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Report generated via{" "}
              <code className="bg-accent px-1 rounded">scanTransactions()</code>{" "}
              +{" "}
              <code className="bg-accent px-1 rounded">
                toComplianceReport()
              </code>{" "}
              from @cloak.dev/sdk. Chain-native scanner reads Cloak program
              transactions directly from RPC and decrypts with the viewing key.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
