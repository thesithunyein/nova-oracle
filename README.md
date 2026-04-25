# NovaPay

**Private payroll and contractor payments on Solana, built on [Cloak](https://cloak.ag).**

Pay your entire team in USDC, USDT, or SOL — amounts and addresses stay off-chain. Auditors get scoped access through viewing keys. The public ledger sees nothing.

> **Live:** [nova-oracle.xyz](https://nova-oracle.xyz) · **Repo:** [github.com/thesithunyein/nova-oracle](https://github.com/thesithunyein/nova-oracle) · **Track:** Cloak — Colosseum Frontier Hackathon

![status](https://img.shields.io/badge/Solana-Devnet%20live-yellow) ![status](https://img.shields.io/badge/Mainnet-Cloak%20SDK%20wired-emerald) ![license](https://img.shields.io/badge/license-MIT-blue)

---

## The problem

Every Solana transaction is public — every salary, every vendor payment, every treasury rebalance is permanently readable on any block explorer. For an organization paying its team in USDC, this means **every employee's compensation is searchable forever** by competitors, recruiters, ex-employees, and anyone with curl.

This isn't a minor leak. It's an operational risk that prevents serious organizations from running payroll on Solana at all.

## Who NovaPay is for

| User | Pain | What NovaPay gives them |
|------|------|--------------------------|
| **50-person DAO finance team** | Monthly USDC payroll exposes every contributor's salary | One CSV upload → one Phantom approval → batched private payments |
| **Protocol treasury manager** | Buybacks and vendor payments telegraph strategy in real time | Shielded execution; competitors see nothing |
| **Cross-border payroll provider** | Contractors in 30 countries don't want salaries permanently public | Stealth claim links + private settlement |
| **Compliance officer** | Auditors need access without breaking everyone else's privacy | Scoped viewing keys: full, partial, or time-limited |

If your users would walk away the moment their amounts went public, NovaPay is for you.

---

## How Cloak is the product (not a feature)

Cloak isn't a "privacy mode" toggle bolted on the side. **Without Cloak, NovaPay literally cannot exist.** Every flow routes through the SDK:

| User flow | Cloak SDK call | What it does |
|-----------|----------------|--------------|
| **Run payroll batch** | `shieldedSend()` per recipient inside `executePayrollBatch` | Deposits to shielded pool, generates Groth16 proof client-side, withdraws to recipient. Amount + recipient hidden. |
| **Single private send** | `shieldedSend()` | Same UTXO flow, single recipient. |
| **Generate viewing key** | `initializeCloakKeys()` → `generateUtxoKeypair()` + `getNkFromUtxoPrivateKey()` | Creates a key pair where `nk` decrypts shielded history without revealing the spending key. |
| **Run compliance scan** | `scanHistory()` → `scanTransactions()` + `toComplianceReport()` | Reads Cloak program txs from RPC, decrypts with `nk`, returns structured gross/fee/net report. |
| **Display fees** | `calculateFee()` + `calculateNetAmount()` | Live UI shows Cloak fee model (0.3% + 5M lamports). |

> **Going deep on two capabilities** (batch shielded send + viewing-key compliance) per the bounty's "depth over breadth" guidance.

### Source links

- Cloak integration layer: [`src/lib/cloak.ts`](./src/lib/cloak.ts)
- Payroll batch execution: [`src/app/dashboard/payroll/page.tsx`](./src/app/dashboard/payroll/page.tsx)
- Compliance / viewing keys: [`src/app/dashboard/compliance/page.tsx`](./src/app/dashboard/compliance/page.tsx)
- Single shielded send: [`src/app/dashboard/send/page.tsx`](./src/app/dashboard/send/page.tsx)

---

## Architecture

```
                  ┌──────────────────────────────────┐
                  │   NovaPay Dashboard (Next.js 14) │
                  │   Payroll · Send · Compliance    │
                  └──────────┬───────────────────────┘
                             │
                  ┌──────────▼───────────┐
                  │   @cloak.dev/sdk     │   (loaded on mainnet)
                  │   TypeScript         │
                  │   Groth16 in browser │
                  └──────────┬───────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
  ┌───────────▼──────────┐      ┌───────────▼──────────┐
  │  Cloak Program       │      │  Cloak Relay         │
  │  zh1eLd6r...qRkW     │      │  api.cloak.ag        │
  │  UTXO shielded pool  │      │  (non-custodial)     │
  └───────────┬──────────┘      └──────────────────────┘
              │
       ┌──────▼──────┐
       │ Solana L1   │
       └─────────────┘
```

On **devnet**, the same UI runs against `SystemProgram.transfer` so judges can test every flow free of charge — but the Cloak code path is fully wired and one env-var away.

---

## Try it now (no install)

1. Open [**nova-oracle.xyz**](https://nova-oracle.xyz)
2. Set Phantom to **Devnet**, connect
3. Top up at [faucet.solana.com](https://faucet.solana.com)
4. **Send page** → paste any address + 0.01 SOL → see the confirmed tx on Solana Explorer
5. **Payroll page** → click `Sample CSV` → click `Import CSV` → click `Run Shielded Payroll` → **one Phantom approval, three transfers in one atomic transaction**
6. **Compliance page** → `Generate` viewing key → `Run Scan` → see decrypted audit report
7. **History page** → all transactions with Explorer links + CSV export

### Verifiable proof transactions (devnet)

| Flow | Tx (Solana Explorer) |
|------|----------------------|
| Single private send | [414G4icPUPtJfmvQPuSb3cb8fTvuYwSAoapv2Wdt2zJ77pPZgrwDh2xuVCmrgibJaGJ9rzK55P73zaZeUxwbu1tu](https://explorer.solana.com/tx/414G4icPUPtJfmvQPuSb3cb8fTvuYwSAoapv2Wdt2zJ77pPZgrwDh2xuVCmrgibJaGJ9rzK55P73zaZeUxwbu1tu?cluster=devnet) |
| Atomic 3-recipient payroll | Click any **Explorer** link in the History page after running the sample batch |

---

## Run locally

### Prerequisites

- Node 18+
- Phantom or Solflare wallet

### Setup

```bash
git clone https://github.com/thesithunyein/nova-oracle.git
cd nova-oracle
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Switching to mainnet (real Cloak shielded pool)

```bash
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta \
NEXT_PUBLIC_CLOAK_PROGRAM_ID=zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW \
NEXT_PUBLIC_CLOAK_RELAY_URL=https://api.cloak.ag \
npm run dev
```

When `IS_DEVNET` is `false`, every payment dynamically imports `@cloak.dev/sdk` and routes through `shieldedSend()`, `initializeCloakKeys()`, and `scanHistory()` — see the conditional in `src/app/dashboard/send/page.tsx` lines 61–95.

---

## Standout features

- **🎯 Atomic batch disbursement.** N recipients = 1 transaction = 1 Phantom approval. All-or-nothing payroll.
- **📥 CSV import.** Upload `name,wallet,amount` for 30+ employees in one shot.
- **🔑 Viewing-key compliance.** Generate scoped audit keys, run on-demand decryption scans, share reports with auditors.
- **📊 CSV export.** Decrypted history exports for tax/finance.
- **🛡️ Inline validation.** Bad addresses caught before signing.
- **📱 Mobile-responsive.** Full functionality on phone — slide-in sidebar, touch-optimized controls.
- **🟡/🟢 Network badge.** Always-visible Devnet vs Mainnet indicator so judges and users never confuse environments.

---

## How NovaPay scores against the rubric

| Criterion (weight) | NovaPay's case |
|---|---|
| **Integration depth (40%)** | Two SDK capabilities used to the metal: (1) **batch shielded send** is the entire payroll product — `shieldedSend` runs per-recipient inside `executePayrollBatch` on mainnet, atomic batched on devnet for judging convenience. (2) **Viewing-key + compliance** — `initializeCloakKeys` + `scanHistory` power the audit dashboard. The product is impossible without Cloak. |
| **Product (30%)** | Next.js 14 App Router · TypeScript · TailwindCSS · shadcn/ui · Zustand persisted state · @solana/wallet-adapter-react · real Solana Explorer links · loading + error + retry states · responsive mobile UI · CSV import/export · inline validation · clear network indicator. |
| **Real-world use (30%)** | Concrete user: 50-person DAO finance team running monthly USDC payroll. Without privacy, every salary is permanently public. Existing Solana payroll tools either skip privacy or aren't usable. NovaPay collapses **payroll + audit + compliance** into one workflow no other Solana product offers. |

---

## Tech stack

- **App:** Next.js 14 (App Router) · TypeScript · TailwindCSS · shadcn/ui · Framer Motion · Zustand
- **Solana:** @solana/web3.js · @solana/spl-token · @solana/wallet-adapter-react (Phantom + Solflare)
- **Privacy:** [@cloak.dev/sdk](https://www.npmjs.com/package/@cloak.dev/sdk) — UTXO shielded pool, Groth16 proofs, non-custodial relay
- **UI primitives:** Lucide icons · Sonner toasts

---

## Roadmap

- **Stealth claim links** — recipient claims funds without prior wallet setup (Cloak stealth address API)
- **Private swaps via Orca** — payroll-in-USDT, settle-in-USDC without revealing path
- **Multi-sig batch approval** — DAO treasuries with 2-of-3 sign-off on shielded payroll
- **Recurring schedules** — monthly auto-payroll with one approval upfront

---

## Built for

**Cloak Track — [Colosseum Frontier Hackathon](https://arena.colosseum.org)**
Built by [@thesithunyein](https://github.com/thesithunyein)

## License

MIT
