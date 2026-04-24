"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  History,
  ExternalLink,
  Download,
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { SOLSCAN_TX } from "@/lib/constants";
import { shortenAddress } from "@/lib/utils";

export default function HistoryPage() {
  const { transactions } = useAppStore();

  const exportCSV = () => {
    const headers = "Date,Type,Amount,Token,Recipient,Status,Transaction\n";
    const rows = transactions
      .map(
        (tx) =>
          `${new Date(tx.timestamp).toISOString()},${tx.type},${tx.amount},${tx.token},${tx.recipient || ""},${tx.status},${tx.txSignature}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nova-pay-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "send":
      case "payroll":
        return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      case "deposit":
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      default:
        return <Shield className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground mt-1">
            All private transactions made through Cloak&apos;s shielded pool.
          </p>
        </div>
        {transactions.length > 0 && (
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        )}
      </div>

      {transactions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Your shielded payment history will appear here. Start by sending a
              private payment or running a payroll batch.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <Card key={tx.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                    {typeIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{tx.type}</span>
                      <Badge
                        variant={
                          tx.status === "confirmed" ? "success" : "warning"
                        }
                      >
                        {tx.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tx.recipient
                        ? `To: ${shortenAddress(tx.recipient, 8)}`
                        : "Shielded transaction"}
                      {" · "}
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {tx.type === "deposit" ? "+" : "-"}
                      {tx.amount} {tx.token}
                    </p>
                    {tx.txSignature && (
                      <a
                        href={SOLSCAN_TX(tx.txSignature)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 justify-end"
                      >
                        Solscan <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
