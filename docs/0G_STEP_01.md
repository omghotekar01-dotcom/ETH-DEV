# RIFT Sponsor 1 / Step 01 — Obtain 0G PC access, select network, and capture first real inference

**Execution status as of 2026-11-06: local setup and self-tests implemented; **no** live inference or request ID verified by this developer environment.** Do not mark Sponsor 1 completed because the code or mocked tests pass.

## Required from a human team member (do not send keys to an AI/chat)

1. Open the **official 0G Private Computer** portal. Mainnet: https://pc.0g.ai ; testnet: https://pc.testnet.0g.ai .
2. Connect/sign in; check the event's allocated compute credits or available balance. **Mainnet and testnet are separate, including API keys and deposits.** Do not deposit your own money unless you explicitly intend to; use event credits when issued.
3. Create a limited **inference `sk-` API key**: Dashboard → API Keys → Create. Do not use an `mk-` management key. Save only to your local ignored `.env`. Do NOT paste into ChatGPT, GitHub, Lovable, Discord, screenshots, or logs.
4. Determine the router environment that matches your actual allocation: `OG_NETWORK=mainnet` (default) or `OG_NETWORK=testnet`.
5. Choose an actual chat-capable model ID from the portal or the `og:models` command; write its exact API identifier to `OG_MODEL`. `OG_TRUST_MODE=standard` is most compatible; `verified` or `private` are optional only where the chosen model supports it.
6. Set `RIFT_ACCESS_TOKEN` to a long random private local value for the browser adviser. On Windows PowerShell: `[Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))`; paste to ignored `.env` directly.

## Local Windows PowerShell (non-billable first)

```powershell
Copy-Item .env.example .env                 # only if .env doesn't already exist; never overwrite your secrets
# Edit .env privately: OG_NETWORK, OG_API_KEY, OG_MODEL, RIFT_ACCESS_TOKEN.
npm run og:check                            # no network call, no expense
npm run og:models                           # list model IDs; no inference; requires Internet
npm run check                               # local test suite
```

**First real inference — only after confirming available 0G credits:**

```powershell
npm run og:run                              # ONE potentially billable inference; NO Hedera payment
```

The script requests one Blackout Protocol recommendation through `planWith0G` and writes a **sanitized** record to `.rift-runtime/og-evidence/<uuid>.json`. This path is ignored by Git. It includes the response request ID but **is not independent proof of inference** and does **not** establish that the judge-facing UI is deployed.

## Judge-facing main-flow verification (next stage after the CLI works)

1. Start `npm run live:start` or `npm start` with the same `.env` loaded. `npm start` does NOT load `.env` automatically; use `node --env-file=.env server/index.mjs` or `npm run live:start`.
2. In RIFT, launch Blackout Protocol → request 0G advice with the operator token → confirm its real 0G request ID and model are displayed → accept a permitted action and watch the sandbox stage react. This is a live *decision* but a fictional in-game credit action, **not a Hedera payment**.
3. Capture an unedited screen recording showing the model advice, unique request ID, and visible agent-state change. Save genuine timestamps and read-only references in a private evidence folder; publish only sanitized facts.
4. Test invalid output/provider outage. RIFT must refuse to fabricate a decision or allow unapproved spending.

## Current blockers / completion gate

- [x] Official mainnet/testnet 0G router endpoints verified; hardcoded network removed from server implementation.
- [x] Safe CLI configuration check, real model catalog call and optional one-shot inference script written.
- [x] New isolated unit tests (model network, authentication separation, trust mode, request-ID propagation).
- [ ] Human obtains 0G credits, `sk-` API key, and an authorized model ID (keep secret private).
- [ ] Human runs `npm run og:check` and confirms key/model are present locally.
- [ ] One actual `npm run og:run` produces a real request ID with the correct network balance.
- [ ] Real main UI flow displays the request ID, model, and resultant safe agent action.
- [ ] Public live demo, video <3 minutes, contacts, and required 0G submission evidence.

**0G completion gate:** real main-flow 0G inference + request ID + functioning, repeatable judge-facing app and the official submission materials. 0G Storage is optional for **Build with 0G PC** (required in a different 0G prize category).

Sources: https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/overview ; https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/authentication ; https://ethglobal.com/events/mumbai/prizes
