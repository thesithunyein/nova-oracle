"use client";

import React, { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Send,
  Users,
  Eye,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  Clock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { SOLSCAN_ACCOUNT } from "@/lib/constants";
import { shortenAddress, formatSOL } from "@/lib/utils";

export default function DashboardPage() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number>(0);
  const { transactions, payrollBatches } = useAppStore();

  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then((bal) => {
        setBalance(bal / LAMPORTS_PER_SOL);
      });
    }
  }, [publicKey, connection]);

  const totalPaid = transactions
    .filter((t) => t.status === "confirmed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBatches = payrollBatches.length;
  const completedBatches = payrollBatches.filter(
    (b) => b.status === "completed"
  ).length;

  const stats = [
    {
      label: "Wallet Balance",
      value: `${balance.toFixed(4)} SOL`,
      icon: Wallet,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Total Paid (Private)",
      value: `${totalPaid.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Payroll Batches",
      value: `${completedBatches}/${totalBatches}`,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Transactions",
      value: `${transactions.length}`,
      icon: Clock,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
  ];

  const quickActions = [
    {
      label: "Run Payroll",
      desc: "Batch-pay your team privately",
      icon: Users,
      href: "/dashboard/payroll",
      variant: "glow" as const,
    },
    {
      label: "Send Payment",
      desc: "Private transfer to one recipient",
      icon: Send,
      href: "/dashboard/send",
      variant: "outline" as const,
    },
    {
      label: "View Compliance",
      desc: "Manage viewing keys & reports",
      icon: Eye,
      href: "/dashboard/compliance",
      variant: "outline" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Private payroll & payments overview
          </p>
        </div>
        {publicKey && (
          <a
            href={SOLSCAN_ACCOUNT(publicKey.toBase58())}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
              {shortenAddress(publicKey.toBase58(), 6)}
              <ExternalLink className="w-3 h-3" />
            </Badge>
          </a>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Card className="border-border/50 hover:bg-accent/50 transition-all duration-200 cursor-pointer group h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <action.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold flex items-center gap-2">
                        {action.label}
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {action.desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Cloak Integration Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                Powered by Cloak SDK — Live on Mainnet
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Every payment runs through Cloak&apos;s UTXO shielded pool with
                Groth16 proofs generated client-side. Program ID:{" "}
                <code className="text-xs bg-background/50 px-1.5 py-0.5 rounded">
                  zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW
                </code>
              </p>
              <div className="flex gap-3 mt-3">
                <a
                  href="https://solscan.io/account/zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    View on Solscan <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
                <a
                  href="https://docs.cloak.ag/sdk/introduction"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm">
                    SDK Docs <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
