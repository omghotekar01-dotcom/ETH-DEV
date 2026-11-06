# RIFT — ETHGlobal Mumbai 2026: Three-Sponsor Execution Master Checklist

> **RESEARCH / IMPLEMENTATION TRACKER — NOT A FINAL PROJECT OR SUBMISSION DECISION.**
> Source of truth: https://ethglobal.com/events/mumbai/prizes (verified November 6, 2026).
> Event deadline shown in existing event/README material: **Saturday, 7 November 2026, 09:00 IST**. Recheck Hacker Dashboard immediately before submitting.
> Working branch: \`feat/rift-agent-arena-20261105-ready\`; keep \`main\` untouched until explicitly approved.
> **We never check off a live qualification based on mocked tests, code existing in the repo, or a pretty UI.**

## Status vocabulary

- **[x] Implemented** = code/docs exist and the tested local functionality works; **NOT necessarily sponsor-qualified**.
- **[ ] Live proof required** = actual network interaction, reproducible artifact, or human submission action not yet independently confirmed.
- **[ ] Optional** = extra-credit work, not a mandatory requirement for the chosen subtrack.
- Under each track, the **GATE** is the point at which we may move to the next sponsor. Save evidence after each gate.

## Confirm the precise prize categories — not the sponsor's total pool

1. **0G — ♾️ Build with 0G PC**, $5,000 prize pool (1st $2,500, 2nd $1,500, 3rd $1,000).
2. **Hedera — 🤖 AI Agents That Pay: x402 on Hedera**, $6,500 pool (1st $3,000, 2nd $2,000, 3rd $1,500).
3. **Arkiv — 🧩 Build on Arkiv (from scratch)**, $4,000 pool (1st $3,000, 2nd $1,000).

**Provisional combined subtrack pool $15,500; no win/eligibility is promised.** Arkiv's from-scratch eligibility must be positively checked against the actual event track selection and commit timeline.

---

## Phase 0 — prerequisites and integrity (before any live spending)

- [x] Public source: https://github.com/omghotekar01-dotcom/ETH-DEV and RIFT implementation branch.
- [x] Game/SVG 2.5D arena, four local missions, three named agents, budget firewall, replay, UI.
- [x] API scaffolding for 0G inference/Storage, Hedera x402 merchant/payer, Arkiv coordination.
- [x] Offline Node test suite and CI; previously reported 50 tests.
- [ ] Run \`git status\`, \`git log -1\` and \`npm run check\` on the actual operator's latest checkout; confirm **50** tests, not 26 from World 002.
- [ ] Confirm the official ETHGlobal submission track (Classic or Continuity), accepted team members, and allowed use of pre-existing code. RIFT's working branch was created during Mumbai; don't assume eligibility just from that.
- [ ] Have human team members review and edit meaningful code/features; log their contributions, and accurately disclose all AI-assisted implementation.
- [ ] Use only disposable, minimally funded **testnet** wallets and store credentials in ignored local \`.env\` or suitable secrets; never post keys in GitHub, chat, demo or browser.
- [ ] Ensure a stable local Node backend and explicitly chosen ports for live mode; do NOT run paid execution on stateless Vercel functions.
- [ ] Confirm internet access, sponsor SDK versions, contract/token IDs, wallet addresses and enough testnet funds. Never claim credentials exist without checking.
- [ ] Capture a "before real network" Git SHA, UTC/IST timestamp and evidence directory. Do not write fabricated receipts.

## Phase 1 — 0G ♾️ Build with 0G PC (FIRST GATE)

**Official must-show requirements**

- [ ] A real **0G Private Computer inference** in the *main user journey*, not just a diagnostic endpoint or a generic chat wrapper.
- [ ] Record and display the **actual provider request ID** corresponding to that decision.
- [ ] The returned model decision really changes what the user sees or what the safe agent controller attempts to do.
- [ ] A functioning app the judge can open and try with a concrete reason to return tomorrow (e.g. reusable autonomous agent-policy training challenges).
- [ ] A one-sentence removal test: **"Without 0G Private Computer, live adaptive agent decisions stop; only the explicitly separate rule-based training sandbox remains."**

**Code already present (not qualification evidence)**

- [x] \`server/index.mjs\` has a network-backed 0G model planner with model response validation and request IDs.
- [x] \`server/live-episode.mjs\` invokes the planner inside a staged run and rejects an unverified inference outcome.
- [x] \`server/og-storage.mjs\` can archive a public sanitized decision episode (additional capability).
- [x] Explicitly labeled local rule-driven training and spending-policy enforcement; no fake network decisions.

**Exact next actions, in execution order**

- [ ] Get the event's allocated 0G compute credits and create/configure a valid 0G PC key through official channels.
- [ ] Check available models and configure \`OG_API_KEY\`, \`OG_MODEL\` directly in local ignored \`.env\` (never send them in chat).
- [ ] Check the full prerequisites of the orchestrator: to run only 0G first, use the protected 0G advisor endpoint; do **not** enable \`RIFT_ENABLE_LIVE_PAYMENTS\` yet.
- [ ] Start the backend, confirm 0G readiness, launch a real mission and request a real model recommendation.
- [ ] Confirm the exact request ID, model, decision JSON, and safe allowlisted action.
- [ ] Apply a valid model suggestion in the sandbox and capture the real effect in UI/log; note that no Hedera money has moved.
- [ ] Run an intentionally invalid/malformed response test and a 0G-unavailable test; model output must not bypass spending limits or fabricate a fallback.
- [ ] Save a sanitized trace: mission, request ID, UTC time, model, status, allowed decision, outcome; never include prompts containing secrets.
- [ ] Verify the public judge-facing app can reproduce the inference flow with test access; provide an explicit fallback demo without claiming local simulation is 0G.
- [ ] Write \`evidence/0g/README.md\` with sanitized real request IDs, reproducible steps, link/screenshots, what fails without 0G and observed limitations.

**Submission requirements for this 0G prize**

- [ ] Public GitHub README + clear setup instructions.
- [ ] Project name and concise description.
- [ ] Working live demo link.
- [ ] Human-recorded demo video **under 3 minutes**.
- [ ] Contract addresses, if any (state none if not applicable).
- [ ] Real team names and Telegram/X contacts.

**Optional 0G extras — do not block the chosen prize**

- [ ] 0G Storage upload with actual Merkle root / tx and retrieval. **Not mandatory for Build with 0G PC**; storage episode/replay/safe-stop are mandatory under the *different* Physical AI prize.
- [ ] iAI login + users spending own daily 0G compute credits (explicit bonus in this track).
- [ ] Document repeat usage/consumer product appeal instead of only a one-time hackathon demo.

**PHASE 1 GATE:** Real 0G inference drives a meaningful mission outcome; authentic request ID and repeatable judge demo are recorded; essential submission details are prepared. **No HEDERA payment tests until this gate is evidenced.**

## Phase 2 — Hedera 🤖 AI Agents That Pay: x402 on Hedera (SECOND GATE)

**Official mandatory**

- [ ] At least one **x402-protected API endpoint** that genuinely settles on Hedera **testnet** (or mainnet, not chosen) using a documented facilitator (Official, Ax402, Blocky402) or a self-hosted facilitator.
- [ ] An autonomous agent or client actually discovers that endpoint and completes **at least one paid request end-to-end with no human per-request approval**. Operator-defined spending rules / preauthorization are appropriate.
- [ ] Public README includes architecture, setup, exact payment flow and **Hedera transaction ID** of at least one genuinely settled payment.
- [ ] Human-recorded demo video **5 minutes or less** showing settlement and its **HashScan** link.

**Current code (still unproven live)**

- [x] x402 testnet merchant \`scripts/x402-merchant.mjs\`; payer \`server/hedera-x402.mjs\`.
- [x] Quote validation before signing, transaction limits, allowlists, no automatic retry after uncertain settlement, local durable run record.
- [x] Unsigned merchant quote/no-spend preflight and a \`live:evidence\` report tool.

**Network execution and proof**

- [ ] Create separate **testnet** payer and merchant receiver accounts and confirm accurate identities.
- [ ] Fund/associate Hedera testnet USDC if using USDC; verify asset ID and the supported facilitator configuration.
- [ ] Install tested x402 SDK versions and record a lockfile.
- [ ] Start merchant endpoint; verify unauthorized GET returns HTTP **402** with expected network, asset, amount and payee.
- [ ] Run \`npm run live:preflight\` and confirm it signs **nothing**.
- [ ] Enable the explicit bounded testnet-only payment mode on a durable local backend.
- [ ] Have 0G choose an allowable BUY and allow the agent to execute **without asking for approval of that individual authorized payment**.
- [ ] Verify the protected service actually responds only after settlement.
- [ ] Capture genuine transaction ID, facilitator receipt, and a working \`https://hashscan.io/testnet/transaction/<ID>\` link.
- [ ] Confirm on HashScan that account, asset, amount, recipient and completion status match the authorized transaction.
- [ ] Prove a changed-quote attempt blocks **before signing** and an unknown/timeout payment state never triggers an automatic duplicate payment.
- [ ] Document the actual observed payment in README with reproducible steps and status; capture a <=5-minute video.

**Optional extra points**

- [ ] Additional per-merchant budgets/allowlists and over-threshold human approval (without interfering with the mandatory autonomous paid request).
- [ ] HCS spending audit, identity via HCS-14/ERC-8004, multi-agent negotiation, HTS token fees, scheduled payments and Hedera Agent Kit if time remains.

**PHASE 2 GATE:** Real x402 paid service response + independently verified Hedera transaction ID + HashScan evidence + autonomous in-policy execution.

## Phase 3 — Arkiv 🧩 Build on Arkiv (from scratch) (THIRD GATE)

**Official mandatory**

- [ ] Explicitly confirm **from-scratch** ETHGlobal Mumbai eligibility and that this is a qualifying new build.
- [ ] An actual write to **Arkiv's current Rabdi testnet** using \`@arkiv-network/sdk\` or JSON-RPC.
- [ ] A **real user-visible feature queries/reads that same Arkiv network data**. An SDK import, write-only audit log, or fabricated feed **does not count**.
- [ ] Provide genuine **writer wallet address(es)** in README and a reproducible query.
- [ ] \`/arkiv/schema.md\`: entity types, queried fields, owner controls, expiration.
- [ ] \`/arkiv/friction.md\`: observed honest integration feedback.
- [ ] One file for each official judging criterion:
  - [ ] \`/arkiv/reach.md\`: who benefits and can use it now/after hackathon.
  - [ ] \`/arkiv/why-arkiv.md\`: what users lose with plain Postgres, what stays off Arkiv.
  - [ ] \`/arkiv/how-you-use-arkiv.md\`: real filters, edit/ownership semantics, TTL and visible user impact.
  - [ ] \`/arkiv/friction.md\`: reproducible developer issues rather than speculation.
- [ ] Open-source repository/license and accurate AI disclosure.

**Current code (still unproven live)**

- [x] \`server/arkiv.mjs\` supports coordinated expiring wallet-owned entities and filtered reads.
- [x] \`arkiv/schema.md\`, \`friction.md\`, \`reach.md\`, \`why-arkiv.md\`, \`how-you-use-arkiv.md\` exist; actual empirical data and real wallet/query evidence are pending.
- [x] Agent planning can receive Arkiv context as untrusted input.

**Network execution and proof**

- [ ] Obtain Rabdi access key and faucet funding for writer wallet; configure private key locally.
- [ ] Install the current SDK and confirm actual \`chainId: 7794095\`.
- [ ] Publish an expiring \`rift.agent-coordination.v2\` entity for a mission and capture entity key, tx, owner, TTL.
- [ ] Query the entity using the documented mission/owner filter; verify contents exactly.
- [ ] Launch RIFT and make the queryable data **visibly appear in the app** and influence the agent's next decision/task.
- [ ] Prove the UI handles expired/missing/unauthorized records correctly.
- [ ] Add real writer address, entity key and runnable query to README and complete honest criterion files with links and observed numbers.
- [ ] Demonstrate write and filtered read in one human-recorded walkthrough.

**Judging weights from Arkiv's rules:** Friction 25%, Reach 25%, Why Arkiv 25%, How You Use Arkiv 25%.

**PHASE 3 GATE:** Real wallet-owned expiring entity written on Rabdi, reproducibly queried back, visible to user and used in live agent flow, all four judging files evidenced.

## Phase 4 — Integrated mission + submission

- [ ] One single coherent episode: **read Arkiv → plan with 0G PC → (optional evidence upload to 0G Storage) → preauthorized Hedera x402 purchase → Arkiv outcome write and read-back**.
- [ ] User can inspect genuine request ID, model, payment tx ID and Arkiv entity in the game UI; no fake badges or real-money claims for simulated credits.
- [ ] True failure states: model outage, rejected spending, merchant unavailable, payment status unknown, Arkiv unavailable after paid settlement; no unverified retry.
- [ ] Browser verify in real Chrome on Windows and mobile viewport; avoid horizontal overflow; actual HTTP routes and CSS load.
- [ ] Public deployment independently checked, including API functionality. A **stateless public Vercel preview is not proof** of protected live paid operation.
- [ ] Confirm public GitHub + license + fresh README with 3 source-specific evidence sections, reproducible commands and contract addresses if applicable.
- [ ] Verify each official prize selection / rules and the **max three sponsor selections** before final submission.
- [ ] Prepare sponsor-specific video(s): 0G **under 3 minutes**, Hedera **<=5 minutes**, Arkiv demo showing actual query, and any general ETHGlobal-required video.
- [ ] Present 4-minute live finalist pitch and Q&A only after a real mission has been demonstrated.
- [ ] Human participants personally test/review and document contributions; AI use accurately disclosed.
- [ ] Submit via the official ETHGlobal Hacker Dashboard by the posted cutoff; check that links and videos are accessible in an incognito browser.
- [ ] Archive submission URLs and event-provided confirmation; never assume submission succeeded without explicit confirmation.

## Run order — do not skip mandatory gates

1. **NOW: 0G PC** — obtain credits/key → run genuine inference → save request ID → prove visible decision.
2. **THEN: Hedera x402** — start merchant → unsigned preflight → one genuinely settled bounded payment → HashScan proof.
3. **THEN: Arkiv** — fund Rabdi wallet → real entity write/query → app-visible use → criterion docs.
4. **FINISH: one combined mission, real browser/deployment validation, videos, final submission.**

## Evidence ledger (fill only with verified facts)

| Evidence field | Value | Verification |
|---|---|---|
| 0G model | **PENDING** | |
| 0G actual request ID | **PENDING** | |
| 0G main-flow screenshot/video | **PENDING** | |
| 0G Storage root / transaction (optional for chosen prize) | **PENDING** | |
| Hedera x402 merchant endpoint | **PENDING** | |
| Hedera paid transaction ID | **PENDING** | |
| Hedera HashScan explorer URL | **PENDING** | |
| Arkiv chain / node | Rabdi / 7794095 per sponsor page; **not yet queried live** | |
| Arkiv writer wallet address | **PENDING** | |
| Arkiv entity key / tx | **PENDING** | |
| Arkiv reproducible query | **PENDING** | |
| Actual public live demo URL | **PENDING verification** | |
| 0G demo video link | **PENDING** | |
| Hedera demo video link | **PENDING** | |
| Submission URL/ID | **PENDING** | |

## Official primary sources and existing repo notes

- https://ethglobal.com/events/mumbai/prizes
- https://ethglobal.com/events/mumbai/info/details
- https://docs.0g.ai/developer-hub/building-on-0g/compute-network/overview
- https://docs.hedera.com/solutions/ai/x402
- https://docs.arkiv.network
- Existing setup: \`docs/THREE_SPONSOR_LIVE.md\`
- Existing hardening: \`docs/WORLD_004_EVIDENCE_LAB.md\`
- Historical implementation tracker: \`docs/PRIZE_CHECKLIST.md\` (this file is the **current** ordered execution tracker).

**Maintainers:** update a checkbox only after linking to the resulting real trace, screenshot, log, transaction or checked-in code. Never put a secret, access key or private wallet key in evidence artifacts.
