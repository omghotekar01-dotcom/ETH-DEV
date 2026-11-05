# World 003: real agentic economy across three ETHGlobal sponsor tracks

**Research-build candidate, not a finalized hackathon choice.** Nothing in this guide is proof of a testnet transaction. Only actual receipt fields from the network count. As of this update, no funded sponsor credentials or real transaction proof were supplied. The training arena does not need them.

## One end-to-end live mission — observable and testable

A player starts **Blackout Protocol** in RIFT's 2.5D city. The currently active stage requires `Signal Intelligence`. The optional **RUN REAL 3-SPONSOR AGENT** command is visible in the Mission deck but safely disabled until every required setting is present and the operator explicitly allows a bounded testnet run.

1. **NOVA scouts Arkiv:** Query public, expiring, wallet-owned RIFT coordination entities from the *real Rabdi network* for this mission. Data is passed to 0G as untrusted context. If Arkiv is unreachable, safe-stop; do not substitute fake results.
2. **VEX plans with 0G PC:** Ask the real 0G Router model to choose `buy`, `execute`, or `wait` given the current step and budget. Record the provider response/request ID. Unknown tools or responses fail closed.
3. **0G Storage archives this decision:** Upload a public, sanitized episode document with that **exact 0G request ID** using `@0gfoundation/0g-storage-ts-sdk` and the funded testnet wallet. Record the returned Merkle root and transaction hash. If upload fails, **no payment happens**.
4. **VEX pays via Hedera x402 if the AI chose BUY:** Query the specific allowlisted merchant GET endpoint, require an HTTP 402 challenge with **Hedera testnet USDC** (`0.0.429274`) going to the exact allowlisted account, enforce a maximum of 1000 smallest token units (= 0.001 USDC), let `@x402/fetch` sign/pay without asking the human for each request, and accept only an actual facilitator success receipt with transaction ID. There is no mainnet path. The **Operator's preconfigured spend policy** and stage constraints always apply.
5. **KAI commits coordination evidence on Arkiv:** Publish the 0G request ID, storage root, selected service, and Hedera transaction ID in an Arkiv wallet-owned entity with 2-day expiry. Query the current mission and writer address back, verify the exact key is returned. User-facing UI then displays those real references.
6. **World state:** On a fully successful real run, the local training map may advance one in-game stage; fictional credits remain a separate counter. A model choice of `wait` or `execute` does not trigger a Hedera payment and is labeled `completed-no-payment`, not a successful three-track paid run.

### Safe-stop and replay

All actions are logged to a durable local JSON file in `.rift-runtime/live-episodes/<runId>.json` **before** any spending. The file is created with `wx` so the same `runId` cannot re-execute; after each network stage it stores progress. Never retry a paid run automatically. If Arkiv fails after Hedera has settled, RIFT returns `partial-payment-settled` including the actual receipt and **DO NOT RETRY**. Each new live mission run requires explicit conscious launch; it never runs merely because somebody opens the page. Disable `RIFT_ENABLE_LIVE_PAYMENTS` when not testing.

**Limitations:** A second process running with a different local disk could reuse a run ID. Do not deploy live paid mode to stateless Vercel functions, multiple replicas, or a shared public service without a durable transactional database and stronger authenticated per-user limits. This is a *testnet-only operator demo*, not a production financial agent.

## Setup: three terminal workflow

Requires Node.js 22.10+, testnet funds/keys **entered only into a local `.env`**. Do not paste keys into ChatGPT, Lovable, source files, or GitHub. The environment file is Git-ignored. Avoid reusing valuable/mainnet private keys.

```bash
npm run check
npm run live:deps             # downloads external SDKs from npm, requires internet
cp .env.example .env          # on Windows PowerShell: Copy-Item .env.example .env
# Fill .env directly in your editor with testnet-only credentials.
# Do not enable payment until the merchant, wallet, facilitator and testnet token are ready.
```

Credential groups:

- `OG_API_KEY`, `OG_MODEL` — ETHGlobal 0G PC compute; `OG_STORAGE_PRIVATE_KEY` — funded 0G testnet wallet for permanent public episode files.
- `HEDERA_ACCOUNT_ID`, `HEDERA_PRIVATE_KEY` — Hedera testnet x402 payer; `HEDERA_SERVICE_ACCOUNT_ID`, `HEDERA_ALLOWED_PAY_TO` — service receiver (same value) and exact allowlist. Payer and receiver should be **separate** funded testnet accounts and have required USDC association. The facilitator pays network fees but successful transfer still requires payer testnet token balance.
- `ARKIV_ACCESS_KEY`, `ARKIV_PRIVATE_KEY` — Arkiv Rabdi access and funded tGLM writer.
- `RIFT_ACCESS_TOKEN` — long random bearer token used for operator-only live execution.
- `RIFT_X402_ENDPOINT=http://127.0.0.1:4021/intel`, `RIFT_X402_ALLOWED_HOST=127.0.0.1`, `RIFT_X402_MAX_UNITS=1000`.
- `RIFT_ENABLE_LIVE_PAYMENTS=true` — opt-in only after verifying all wallets and merchant readiness.

Terminal 1 — start paid API service:

```bash
npm run live:merchant
```

Terminal 2 — start protected game backend:

```bash
npm run live:start
```

Terminal 3 — test health and the genuine x402 challenge before launch:

```bash
curl http://localhost:3000/api/health
curl -i 'http://127.0.0.1:4021/intel?mission=blackout&service=recon'
```

The merchant should return **HTTP 402**, not 200. In the UI, launch Blackout Protocol, confirm live readiness, press **RUN REAL 3-SPONSOR AGENT**, and supply the `RIFT_ACCESS_TOKEN`. The first auth prompt grants the run endpoint access, but the user is **not asked to authorize each small payment**. A real 0G inference can select `wait` or `execute`; this is not a forced payment demo. Re-run deliberately with a fresh UUID only after inspecting the previous record, not automatically.

### Reproduce sponsor evidence

For a complete paid run, save only these public facts (never private keys):

- 0G `requestId`, selected model, storage `rootHash` and `txHash`.
- Hedera transaction ID and public `https://hashscan.io/testnet/transaction/<id>` link from the facilitator's settlement receipt. Independently confirm with HashScan.
- Arkiv `entityKey`, `txHash`, writer wallet address, and filtered query (`mission = "blackout"`, owner = writer). The System page's feed and `server/arkiv.mjs` are live reads, not a local replica.
- Screenshots or a human-recorded video showing the exact transaction and read-back. No fabricated evidence.

## Sponsor rule checkpoints

Official: https://ethglobal.com/events/mumbai/prizes

| Sponsor | User-observable integration | Still needed to qualify |
| --- | --- | --- |
| 0G — Build with 0G PC | Decision inside agent loop, episode on 0G Storage, request IDs, replay and safe-stop | Real 0G model call, storage transaction, live link, eligible demo (<3 mins), proof and contacts |
| Hedera — AI Agents That Pay | Own x402-protected endpoint, autonomous pre-budgeted paid client, HashScan receipt | Real end-to-end settled testnet payment and proof in README, ≤5 min demo |
| Arkiv — Build on Arkiv | Mission coordination entities expire, read/query from app, written by wallet | Real funded write/readback, wallet address, query, empirical feedback, eligibility confirmation for from-scratch vs continuity |

**Track eligibility:** RIFT started during ETHGlobal Mumbai in this repository, but the user has not authorized declaring the actual ETHGlobal submission track. Confirm Classic vs Continuity conditions and record genuine dated development. Include human-authored contributions, AI disclosure and a personal demo. 0G's or Arkiv's "from scratch" prize cannot be treated as eligible merely because the code compiles.

## Security and infrastructure restrictions

- Never move Hedera funds on mainnet; URLs, CAIP network, token ID and receiver must match allowlist.
- Server checks the 402 quote **before any signer is created**. An HTTP 200 without a signed payment receipt is not payment success.
- Only a durable single-process Node backend may run paid mode. `/api/agent/live` on Vercel returns 503 by design.
- No secrets in browser, localStorage, logs, or 0G public episode. The UI only holds a short-lived access token in memory.
- No retry on unknown settlement result. Inspect the ledger and HashScan before spending again.
- Agent action, merchant and per-request amount are server-validated. The model cannot override its own restrictions.
- No fake model fallback if 0G fails; an offline simulator is an explicitly different mode.
