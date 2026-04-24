"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  Eye,
  FileCheck,
  ArrowRight,
  Lock,
  Zap,
  Globe,
  ChevronRight,
  Github,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: Shield,
    title: "Shielded Payroll",
    desc: "Batch-pay your entire team in one transaction. Amounts and addresses stay hidden from block explorers.",
  },
  {
    icon: Users,
    title: "Multi-Recipient Batching",
    desc: "Fan out payments to 50+ recipients from a single shielded pool. Each person claims privately.",
  },
  {
    icon: Eye,
    title: "Viewing Keys",
    desc: "Grant scoped audit access. Finance sees everything, auditors see amounts only, regulators get time-limited keys.",
  },
  {
    icon: FileCheck,
    title: "Compliance Reports",
    desc: "One-click compliance scans with structured reports. Decrypts only what the key allows.",
  },
  {
    icon: Lock,
    title: "Zero-Knowledge Proofs",
    desc: "Groth16 proofs generated client-side in seconds. Your browser proves validity — no server sees plaintext.",
  },
  {
    icon: Globe,
    title: "Cross-Border Ready",
    desc: "USDC and USDT move globally. Recipients claim via link — no Cloak setup needed on their end.",
  },
];

const steps = [
  {
    num: "01",
    title: "Connect & Shield",
    desc: "Connect your wallet and deposit SOL, USDC, or USDT into the shielded pool.",
  },
  {
    num: "02",
    title: "Create Payroll",
    desc: "Add recipients with wallet addresses, amounts, and token type. Save as a batch.",
  },
  {
    num: "03",
    title: "Execute Privately",
    desc: "One click runs all payments through Cloak's shielded pool. Nothing visible on-chain.",
  },
  {
    num: "04",
    title: "Audit on Demand",
    desc: "Share a viewing key with your auditor. They decrypt exactly what they need — nothing more.",
  },
];

export default function LandingPage() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">NovaPay</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a
                href="https://docs.cloak.ag/sdk/introduction"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                SDK Docs
              </a>
              <a
                href="https://github.com/thesithunyein/nova-oracle"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </div>
            <div className="flex items-center gap-3">
              {connected ? (
                <Link href="/dashboard">
                  <Button variant="glow" size="sm">
                    Dashboard <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <WalletMultiButton />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-sm mb-8">
              <Zap className="w-3.5 h-3.5" />
              Powered by Cloak SDK — Live on Solana Mainnet
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Private Payroll for{" "}
              <span className="gradient-text">Solana</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Pay your team in USDC, USDT, or SOL without exposing amounts or
              addresses on-chain. Batch disbursement, viewing keys for auditors,
              and compliance reports — all shielded.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {connected ? (
                <Link href="/dashboard">
                  <Button variant="glow" size="xl">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <WalletMultiButton />
              )}
              <a
                href="https://github.com/thesithunyein/nova-oracle"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="xl">
                  <Github className="w-5 h-5" />
                  View Source
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            {[
              { label: "Protocol", value: "Cloak v1" },
              { label: "Program ID", value: "zh1eL...qRkW" },
              { label: "Network", value: "Mainnet" },
              { label: "Tokens", value: "SOL · USDC · USDT" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-xl p-4 text-center"
              >
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need for{" "}
              <span className="gradient-text">private payments</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built on Cloak&apos;s UTXO shielded pool with Groth16 proofs.
              Privacy isn&apos;t a feature — it&apos;s the foundation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="glass rounded-2xl p-6 hover:bg-white/[0.08] transition-all duration-300 group"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Four steps from treasury to private payroll. No circuit builds, no
              Merkle tree syncing, no prover infrastructure.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="relative"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <div className="text-6xl font-bold text-primary/10 mb-4">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
                {i < 3 && (
                  <ChevronRight className="hidden lg:block absolute top-8 -right-4 w-6 h-6 text-primary/20" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <div className="glass rounded-3xl p-12 glow">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to pay privately?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Connect your Solana wallet and run your first shielded payroll
                in under two minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {connected ? (
                  <Link href="/dashboard">
                    <Button variant="glow" size="xl">
                      Open Dashboard
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <WalletMultiButton />
                )}
              </div>
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Client-side ZK proofs
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Non-custodial
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Live on mainnet
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold gradient-text">NovaPay</span>
              <span className="text-sm text-muted-foreground ml-2">
                by nova-oracle.xyz
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/thesithunyein/nova-oracle"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Github className="w-4 h-4" /> GitHub
              </a>
              <a
                href="https://docs.cloak.ag"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" /> Cloak Docs
              </a>
              <a
                href="https://solscan.io/account/zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" /> Solscan
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for Cloak Track — Colosseum Frontier Hackathon
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
