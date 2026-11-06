# RIFT architecture and trust boundaries

**Product intent:** RIFT visibly solves the fear of an autonomous AI agent acting beyond a user's explicit spending constraints. The core interactive loop is a small game, not a simulated blockchain proof.

## Paths

1. **Training (always available):** `public/app.mjs` renders the city and routes actions through `public/engine.mjs`. The pure reducer handles missions, costs, state transitions, approvals, risk flags and event logs. Browser localStorage persists sandbox state. All costs are fictional and clearly labeled.
2. **0G advisor (opt-in):** browser sends only constrained mission context + a private demo access token to `/api/agent/plan`. Server calls `https://router-api.0g.ai/v1/chat/completions` using server-side `OG_API_KEY`. Returned plan must pass strict allowlist validation; it has no wallet access. Real response IDs are preserved only when provided by 0G. This is external inference, not an onchain spend.
3. **Arkiv mission feed (opt-in):** operator uses `scripts/arkiv-publish.mjs` to sign and write a public time-limited entity on the Rabdi testnet, then read it back. `/api/arkiv/feed` reads real chain/indexer data for the UI. Missing/unavailable providers are reported honestly, never silently replaced by local data.
4. **Hedera x402 payment experiment (opt-in):** `scripts/hedera-x402.mjs` is operator-run and only pays an explicitly allowlisted HTTPS merchant on Hedera **testnet**. It confirms a real `402` challenge and checks asset/network/pay-to/maximum amount before signing; it refuses to present a receipt unless settlement evidence exists. This path is NOT yet joined into the browser mission engine.

## State transitions

`idle → running → (paused ↔ running) → (approval → running or lost) → won/lost`

`ABORT`, budget exhaustion and rounds deadline end in `lost`. Selecting new mission creates fresh mission state but retains earned score and cleared mission IDs. Duplicate service purchases during a stage are ignored. A simulated unauthorized payment is logged as `blocked` and cannot touch the budget.

## Security controls and known limitations

- No wallet private keys in frontend assets.
- Backend 0G secret only loaded from environment. Demo token uses constant-time comparison, and local server adds request rate limits; production needs a more robust per-user auth and spend/rate budget.
- AI tool actions are **not** executed automatically. Model output is parsed as restricted JSON and is never interpreted as code.
- External network status means **configuration**, not proof. Proof requires actual response IDs, receipts and read-backs.
- Local mission history and replay are non-tamper-evident and non-durable; do not market them as decentralized audit guarantees.
- Arkiv storage is public. Publish only intentionally public mission metadata.
- The x402 CLI is **not** a general-purpose arbitrary URL proxy; it rejects non-HTTPS URLs, non-allowlisted merchants, wrong recipient, wrong network/asset or excessive amounts. It has no retry loop that could inadvertently spend twice.
- The file server applies path traversal restrictions and standard response hardening.
- Accessibility, mobile layouts and live integrations require human browser and device validation.

## No hidden fake integrations

No sample transaction ID, completed onchain write, actual 0G request ID, verified sponsor eligibility, production URL, or success metric is hardcoded or fabricated. Successful mocked 0G tests are clearly fixture tests.


## World 003 orchestration (Nov 6 2026)

For a **live, explicitly authorized testnet-only episode**, `server/live-episode.mjs` composes `readArkiv` (prior coordination state), `planWith0G` (real model decision), `upload0GEpisode` (0G Storage audit root and chain tx), `payHederaService` (actual 402 payment only after model chooses correct service), and `publishArkiv` (wallet-owned expiring entity with real network read-back). A local `RunLedger` reserves a UUID before executing and refuses duplicates. `GET /api/agent/receipt` makes the saved run receipt retrievable by its operator token; secrets are not stored. This is **not** production hardened for concurrent replicas and paid mode is disabled on stateless Vercel.

The game remains an expressly labeled **fictional credits** sandbox. Live receipts and game credits are different data types; `RECORD_LIVE_EPISODE` records real proof fields returned by the network but does not itself spend fictional credits. The UI only advances the local stage after a validated three-provider result. See [THREE_SPONSOR_LIVE.md](THREE_SPONSOR_LIVE.md) for run instructions.
