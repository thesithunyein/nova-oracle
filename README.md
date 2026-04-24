# NovaPay — Private Payroll on Solana

> Private payroll and contractor payments on Solana, powered by the [Cloak SDK](https://docs.cloak.ag/sdk/introduction). Pay your team in USDC, USDT, or SOL without exposing amounts or addresses on-chain.

**Live:** [https://nova-oracle.xyz](https://nova-oracle.xyz)  
**Program ID:** `zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW` ([View on Solscan](https://solscan.io/account/zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW))  
**Network:** Solana Mainnet

---

## The Problem

Every transaction on Solana is public. When an organization pays its team in USDC, every salary is permanently readable on any block explorer. Payroll amounts get indexed, searched, and used by competitors, recruiters, and anyone watching. For businesses running on Solana, this is an operational risk — not a minor inconvenience.

**NovaPay exists for organizations that need to pay people on Solana without making financial data public.**

Target users:
- **DAOs and protocols** paying contributors in stablecoins
- **Companies** running crypto payroll for remote teams
- **Freelance platforms** disbursing contractor payments
- **Any organization** where salary privacy is a precondition, not a nice-to-have

---

## How the Cloak SDK Is Used

NovaPay uses the Cloak SDK as the **core execution layer** — every payment flows through Cloak's UTXO shielded pool with Groth16 proofs generated client-side. This is not a wrapper around standard Solana transfers with "privacy" branding — Cloak is the mechanism that makes the product function.

### SDK Capabilities Used

| Capability | How NovaPay Uses It |
|---|---|
| **Private transfers** (`transact` → `fullWithdraw`) | Every payment deposits to the shielded pool and withdraws to the recipient. Amount, sender, and recipient are hidden on-chain. |
| **Batch disbursement** | Payroll batches iterate through recipients, executing shielded sends for each. One admin action, many private payments. |
| **Viewing keys** (`generateUtxoKeypair` + `getNkFromUtxoPrivateKey`) | Admins generate viewing keys and share them with auditors. Full, scoped, or time-limited access to decrypted history. |
| **Compliance scanning** (`scanTransactions` + `toComplianceReport`) | Chain-native scanner reads Cloak program transactions from RPC, decrypts with viewing key, and produces structured reports with gross/fee/net per transaction. |
| **Fee calculation** (`calculateFee`, `calculateNetAmount`) | Real-time fee display using Cloak's fee model (0.3% + 5M lamports fixed). |

### Integration Architecture

```
User connects wallet
        ↓
NovaPay Dashboard (Next.js)
        ↓
@cloak.dev/sdk (TypeScript)
        ↓
┌─────────────────────────────┐
│  Cloak UTXO Shielded Pool   │
│  Program: zh1eLd6r...qRkW   │
│  Groth16 proofs (client)     │
│  Relay: api.cloak.ag         │
└─────────────────────────────┘
        ↓
Solana Mainnet
```

### Key SDK Functions Used

```typescript
// Deposit to shielded pool
import { transact, createUtxo, createZeroUtxo } from "@cloak.dev/sdk";
const deposited = await transact({ inputUtxos, outputUtxos, externalAmount, depositor }, options);

// Withdraw to recipient (private send)
import { fullWithdraw } from "@cloak.dev/sdk";
await fullWithdraw(deposited.outputUtxos, recipientWallet, { ...options, cachedMerkleTree });

// Generate viewing key
import { generateUtxoKeypair, getNkFromUtxoPrivateKey } from "@cloak.dev/sdk";
const scanKeypair = await generateUtxoKeypair();
const viewingKeyNk = getNkFromUtxoPrivateKey(scanKeypair.privateKey);

// Compliance scan
import { scanTransactions, toComplianceReport } from "@cloak.dev/sdk";
const scan = await scanTransactions({ connection, programId, viewingKeyNk, limit: 250 });
const report = toComplianceReport(scan);
```

---

## Features

- **Shielded Payroll** — Batch-pay your entire team in one workflow. Each recipient gets a private transfer through Cloak's shielded pool.
- **Private Send** — Single private transfers of SOL, USDC, or USDT to any Solana wallet.
- **Viewing Key Management** — Generate, label, and share viewing keys. Full audit key for finance, scoped key for external auditors.
- **Compliance Reports** — One-click chain-native scanning that decrypts transaction history with a viewing key and generates structured reports.
- **Transaction History** — Decrypted history for key holders with CSV export. On-chain, nothing is visible.
- **Real Solscan Links** — Every transaction links directly to Solscan showing the real mainnet transaction (which reveals nothing about amounts or recipients).

---

## Setup & Run Instructions

### Prerequisites
- Node.js 18+
- A Solana wallet (Phantom or Solflare recommended)
- SOL for transaction fees (mainnet)

### Local Development

```bash
# Clone the repository
git clone https://github.com/thesithunyein/nova-oracle.git
cd nova-oracle

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_CLOAK_PROGRAM_ID=zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW
NEXT_PUBLIC_CLOAK_RELAY_URL=https://api.cloak.ag
```

### Build for Production

```bash
npm run build
npm start
```

---

## Deployed Links

| Resource | Link |
|---|---|
| **Live App** | [https://nova-oracle.xyz](https://nova-oracle.xyz) |
| **Cloak Program (Solscan)** | [zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW](https://solscan.io/account/zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW) |
| **GitHub** | [github.com/thesithunyein/nova-oracle](https://github.com/thesithunyein/nova-oracle) |

---

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** TailwindCSS + shadcn/ui components
- **Privacy Layer:** @cloak.dev/sdk (UTXO shielded pool, Groth16 proofs)
- **Blockchain:** @solana/web3.js, @solana/spl-token
- **Wallet:** @solana/wallet-adapter-react (Phantom, Solflare)
- **State:** Zustand (persisted)
- **Animations:** Framer Motion

---

## Built for

**Cloak Track — Colosseum Frontier Hackathon**  
[Build real world payment solutions with privacy](https://earn.superteam.fun)

---

## License

MIT
