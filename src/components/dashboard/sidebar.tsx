"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Send,
  Eye,
  History,
  Shield,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NovaLogoFull } from "@/components/ui/nova-logo";
import { useWallet } from "@solana/wallet-adapter-react";
import { shortenAddress } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/payroll", label: "Payroll", icon: Users },
  { href: "/dashboard/send", label: "Send", icon: Send },
  { href: "/dashboard/compliance", label: "Compliance", icon: Eye },
  { href: "/dashboard/history", label: "History", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const { publicKey } = useWallet();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 h-16 border-b border-border">
          <Link href="/">
            <NovaLogoFull size={30} />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-border space-y-3">
          <a
            href="https://solscan.io/account/zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-accent transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Cloak Program on Solscan
          </a>
          {publicKey && (
            <div className="px-3 py-2 rounded-lg bg-accent/50">
              <p className="text-xs text-muted-foreground">Connected</p>
              <p className="text-sm font-mono font-medium">
                {shortenAddress(publicKey.toBase58(), 6)}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
