# RIFT — The Agent Spending Firewall

**A playable strategy game that demonstrates a simple real problem: an autonomous AI agent may spend money or take an action you did not authorize. RIFT makes its decisions, budget limits, and human checkpoints visible.**

> **STATUS — ETHGlobal Mumbai 2026 exploratory candidate, NOT a finalized project choice.** The core game runs locally without third-party credentials. All sandbox spending is fictional. Sponsor integrations below require real credentials, funded testnet accounts, execution, and independent verification; they have **not** been claimed as completed onchain transactions.


## World 003 — three mandatory sponsor flows with real AI agents (research build)

The **World 002 3D-style city game** remains completely playable offline. In the Mission Command deck, a new **Live Agent Economy** shows **0G PC + 0G Storage → Hedera x402 → Arkiv Rabdi** and a guarded **RUN REAL 3-SPONSOR AGENT** button. That button is disabled until all 3 services and the local durable ledger are configured. No mocked transactions or model decisions can satisfy the prize gates. Our current environment has **not** run real funded testnet actions.

See **[docs/THREE_SPONSOR_LIVE.md](docs/THREE_SPONSOR_LIVE.md)** for setup, three-terminal run instructions, security gates, and the exact proofs needed. The `npm run live:deps` command installs official SDK dependencies only when live network mode is desired. `npm start` remains dependency-free for the local sandbox. Tests include a mocked three-provider orchestration and safe-stop cases, but mocks are never displayed as live provider evidence.

**Important:** A model that chooses WAIT/EXECUTE intentionally results in **no Hedera payment**; it is not called a complete three-sponsor paid run. Hedera requires a genuine paid 402 request, and Arkiv requires real wallet-owned entities read by a user-visible feature. 0G additionally requires a real model request and uploaded episode record with its request ID.

## 30-second demonstration

1. Select **Start Playing** → **Blackout Protocol**.
2. Click **Simulate Rogue Agent**. A fictional agent tries to pay **999 sandbox credits to an unapproved merchant**; the spending firewall blocks the attempt and the balance remains unchanged.
3. Execute mission steps manually, or press **Auto Run** for the clearly labeled deterministic rule-driven loop.
4. Start **Vault Breach** to show a high-risk action waiting for human approval or denial.
5. Open **Replay** to inspect the trace and export a JSON transcript. Under **Setup**, inspect which real integrations are configured and query Arkiv when connected.

### The problem in one line

**AI agents can act faster than humans can review — RIFT tests whether their spending and permissions stay within explicit guardrails.**

### What actually works today (World 002 + World 003 code)

| Feature | Current status |
|---|---|
| Responsive, clickable six-district tactical map | Implemented, local simulation |
| Four distinct missions, three role-based agents, budget/score logic | Implemented, tested |
| Rogue-payment firewall (limit + merchant allowlist) | Implemented, tested — simulated amounts only |
| Human checkpoint, deny path, pause/resume/abort | Implemented, tested |
| Rule-based Auto Run | Implemented; NOT an LLM |
| Service shop, stage duplicate blocking | Implemented; fictional credits |
| Replay, event log and JSON export | Implemented; local-only, not a blockchain proof |
| 0G PC in live agent decision loop | Implemented with strict request validation; needs actual API key and network proof |
| 0G Storage episode archive | SDK integration and tests added; needs funded 0G testnet wallet and real upload proof |
| Arkiv read/write/query-back | Indexed expiring mission coordination v2 entities with pre-decision query + readback; needs funded Rabdi writer and live verification |
| Hedera x402 autonomous testnet paid request | Own x402 protected merchant endpoint + auto-paying bounded client code; requires real testnet USDC and successful settlement |
| Standalone Vercel research preview | Deployment reported READY; public page/API reachability still requires independent external check |


## Glasshouse iOS-style UI (2026-11-05)

This feature branch includes a redesigned responsive web interface inspired by Apple HIG patterns: floating navigation, restrained glass surfaces, a city map, and an interactive spending-firewall demonstration. The design is original web CSS/SVG, **not a native iOS app**. All payments in training mode remain fictional.

The key CSS files are `public/style.css` (existing application) and `public/ios.css` (new design layer). They are linked using **root-relative paths** in `public/index.html` to avoid missing styles on nested URLs. The default local server serves both files. No Lovable tokens or proprietary UI dependencies are required.

See [UI design and architecture](docs/UI_SYSTEM.md) and [QA report](docs/QA_REPORT.md).

## Quick start

Requires Node.js 22.10+. There are **no required npm packages to run the local game**.

```bash
git clone --branch feat/rift-agent-arena-20261105-ready --single-branch https://github.com/omghotekar01-dotcom/ETH-DEV.git
cd ETH-DEV
npm run check
npm start
```

Visit **http://localhost:3000**. To use a different port, set `PORT=5173` (macOS/Linux) or `$env:PORT=5173` (PowerShell).

**Important:** `main` currently contains only an initial README. RIFT is developed on the feature branch above and is kept separate until explicit approval. If you cloned before reading this, run `git fetch origin && git switch feat/rift-agent-arena-20261105-ready` (Git 2.23+), or `git checkout -b feat/rift-agent-arena-20261105-ready origin/feat/rift-agent-arena-20261105-ready`.

### One-click local launch

On **Windows**, after checking out the RIFT branch, double-click `RUN-WINDOWS.bat`. On **macOS/Linux**, run `sh RUN-UNIX.sh`. These scripts only start the local sandbox; they do not make payments, deploy contracts, or require API keys.

A **Vercel preview** of the research prototype is reported `READY` by the deployment platform at `https://rift-ethglobal-research-2ljpzey6f-aaaaaaa-5a4f.vercel.app/`; it is not a production/sponsor-verified release. If this preview is unavailable or protected for you, use the local startup steps above. Vercel's GitHub integration is not connected to this repository, so the preview is not automatically redeployed on each GitHub push.

For quick frontend previews, serve `public/` with any static HTTP server. **Do not** double-click `index.html` on disk: browsers commonly block module imports under `file://`.

## Optional live 0G inference (provider API, no blockchain spending)

Copy `.env.example` values into your hosting environment or export them before starting the server. Do **not** commit secrets.

```bash
export OG_API_KEY='obtain-from-0g-private-computer'
export OG_MODEL='model-id-from-0g-dashboard'
export RIFT_ACCESS_TOKEN='create-a-long-random-unguessable-token'
npm start
```

When an active mission is running, **Ask 0G for a plan** prompts for the demo token (kept in the browser tab's memory only). The backend calls the official OpenAI-compatible 0G router and validates a tiny, allowlisted JSON plan. It returns a real request ID only when a real provider response includes one. It never gives AI access to a wallet, arbitrary URLs or unchecked payment tools. The model cannot override the budget policy. Production deployment with a funded inference API requires real authentication and rate limiting beyond this private demo gate.

0G docs: https://docs.0g.ai/developer-hub/building-on-0g/compute-network/overview

## Optional Arkiv Rabdi integration (real testnet only)

Install external SDKs when online and obtain Rabdi testnet GLM from the faucet:

```bash
npm install @arkiv-network/sdk viem
export ARKIV_ACCESS_KEY='get-from-arkiv-hub'
export ARKIV_PRIVATE_KEY='private-key-for-testnet-only'
node scripts/arkiv-publish.mjs blackout blocked "Firewall refused unknown merchant" "Public simulation outcome, NOT a Hedera settlement"
```

The script writes a wallet-owned **2-day entity** and performs a real read-back query. The app's **Setup → Query Arkiv Network** performs a separate read via `/api/arkiv/feed` when configured. An indexer delay or SDK/API failure must be reported as a failure, never as successful persistence. Do not publish private user data.

Arkiv docs: https://docs.arkiv.network/start-here/first-entity/

## Optional Hedera x402 settlement (real testnet only)

**Never use a mainnet private key.** The CLI makes a payment only after verifying: HTTPS, explicitly allowlisted hostname and recipient, Hedera testnet, HBAR asset, exact scheme, and a tight per-payment cap.

```bash
npm install @x402/core @x402/hedera @x402/fetch @hiero-ledger/sdk
export HEDERA_ACCOUNT_ID='0.0.123456'
export HEDERA_PRIVATE_KEY='testnet-only-private-key'
export HEDERA_ALLOWED_PAY_TO='0.0.234567'
export RIFT_X402_ENDPOINT='https://your-approved-testnet-merchant.example/resource'
export RIFT_X402_ALLOWED_HOST='your-approved-testnet-merchant.example'
export RIFT_MAX_TINYBAR='1000000'
node scripts/hedera-x402.mjs
```

The script expects an authentic HTTP 402 challenge and a successful settlement receipt. It outputs the **actual Hedera transaction ID** only if received and validated. The CLI is NOT automatically invoked by the UI, and sandbox credits are NOT HBAR. **Until a successful testnet transaction is independently shown on HashScan, Hedera sponsor requirements are NOT met.**

Hedera docs: https://docs.hedera.com/solutions/ai/x402/pay-with-x402

## Project organization

```text
public/          Framework-free responsive game, tactical map, pure mission engine
server/          Secure local server, 0G inference adapter, Arkiv adapter
api/             Optional Vercel serverless handlers
scripts/         Explicit real testnet integration CLIs
arkiv/           Arkiv schema and sponsor-criterion reports
scripts/         Operator-only integration scripts (not public client wallet)
tests/           Node's built-in test runner
.github/workflows/  Test CI
 docs/           Architecture, testing, project decisions and human/AI contributions
```

## Event rules and submission truthfulness

ETHGlobal permits AI tools **only alongside meaningful human contribution**. Human teammates must review, implement and independently test meaningful parts; attribute all AI assistance. Do not claim sponsor eligibility, finalist selection, live inference, deployment or network transaction that is not actually verified. Classic track work must start after hacking begins; distinguish reused starter material from new work in the final submission. Use small traceable commits.

Submission deadline: **November 7, 2026, 9:00 AM IST**. Up to **3 partner prize sponsors**. The shortlisted sponsor trio (not yet finalized) is **0G + Hedera + Arkiv**, each with separate exact qualification requirements. See `docs/PRIZE_CHECKLIST.md`.

**Source:** https://ethglobal.com/events/mumbai/info/details and https://ethglobal.com/events/mumbai/prizes

## Attribution

Development commit attribution requested by the project owner: **Om Ghotekar <omghotekar01@gmail.com>**. The connected GitHub publishing account is `omghotekar01-dotcom` (Omiiii). See `docs/AI_DISCLOSURE.md` and `docs/HUMAN_CONTRIBUTIONS.md` for required event-compliant human work.

MIT License. Research-only status remains until explicitly promoted to an official decision.

## World 002 — Cinematic Arena UX (research branch)

The Arena now has six purpose-built original SVG district structures, a zoomable/focusable tactical city, quick-launch missions, a live Command deck, a state-bound security-event visualization, and iOS/macOS-inspired responsive styling. The actual training engine, API boundaries, and policy checks remain unchanged. See [`docs/ARENA_WORLD_002.md`](docs/ARENA_WORLD_002.md) and [`docs/QA_REPORT.md`](docs/QA_REPORT.md).

The page now loads a third local stylesheet: `public/arena.css` (after the base and Glasshouse design sheets). You do **not** need Lovable credits or any new npm dependencies to run this update. **No crypto is transferred:** the 999-credit blocked event is a deterministic local policy demonstration.
