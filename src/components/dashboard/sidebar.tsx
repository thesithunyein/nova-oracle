"use client";

import React, { useState } from "react";
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
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NovaLogoFull } from "@/components/ui/nova-logo";
import { useWallet } from "@solana/wallet-adapter-react";
import { shortenAddress } from "@/lib/utils";
import { IS_DEVNET, NETWORK } from "@/lib/constants";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/payroll", label: "Payroll", icon: Users },
  { href: "/dashboard/send", label: "Send", icon: Send },
  { href: "/dashboard/compliance", label: "Compliance", icon: Eye },
  { href: "/dashboard/history", label: "History", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const { publicKey, disconnect } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-border">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <NovaLogoFull size={30} />
        </Link>
        <button
          className="lg:hidden p-1 rounded-md hover:bg-accent"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
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
              onClick={() => setMobileOpen(false)}
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
        {/* Network badge */}
        <div className={cn(
          "px-3 py-2 rounded-lg flex items-center gap-2 text-xs",
          IS_DEVNET ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-emerald-500/10 border border-emerald-500/20"
        )}>
          <span className={cn(
            "w-1.5 h-1.5 rounded-full animate-pulse",
            IS_DEVNET ? "bg-yellow-400" : "bg-emerald-400"
          )} />
          <span className={IS_DEVNET ? "text-yellow-400" : "text-emerald-400"}>
            {IS_DEVNET ? "Devnet (test)" : "Mainnet (live)"}
          </span>
        </div>
        <a
          href="https://explorer.solana.com/address/zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW?cluster=devnet"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-accent transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Cloak Program on Explorer
        </a>
        {publicKey && (
          <div className="px-3 py-2 rounded-lg bg-accent/50 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Connected</p>
              <p className="text-sm font-mono font-medium truncate">
                {shortenAddress(publicKey.toBase58(), 6)}
              </p>
            </div>
            <button
              onClick={() => disconnect()}
              title="Disconnect wallet"
              className="p-1.5 rounded-md hover:bg-destructive/20 hover:text-destructive transition-colors text-muted-foreground"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 z-50 h-screen w-72 border-r border-border bg-card transform transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
        {sidebarContent}
      </aside>
    </>
  );
}
