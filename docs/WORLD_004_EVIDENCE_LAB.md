# RIFT World 004 — payment safety and evidence lab

**Scope:** ETHGlobal Mumbai 2026 exploratory implementation. A real sponsor-compliant network execution is **not** yet independently verified. This patch fixes critical failure boundaries and makes the three-sponsor run easier to evaluate. The underlying game engine, 0G Private Computer planner, 0G Storage, Hedera x402 payment adapter, and Arkiv query/read-back remain in place.

## Changes

1. **x402 quote drift protection:** Validate the first Hedera 402 quote **and every 402 intercepted by the SDK payment fetch wrapper**. The amount, payee, network, and asset must not change between the preflight challenge and the signature flow. The default network is `hedera:testnet`, asset `0.0.429274` (Hedera testnet USDC), recipient `HEDERA_ALLOWED_PAY_TO`, cap `RIFT_X402_MAX_UNITS`. We still require the external facilitator to enforce the Hedera exact scheme correctly.
2. **No silent retries after ambiguous payment:** Before invoking the paid request, persist `paymentAttemptedAt` to the local run ledger. If the payer times out or a settlement receipt cannot be confirmed, mark the run `payment-status-unknown` and advise **DO NOT RETRY**, because a transfer may already have completed. A verified settlement followed by an Arkiv failure remains `partial-payment-settled`.
3. **Arkiv query-back integrity:** Compare all public fields (mission, status, decision, evidence, requestId, service, hederaTx), the entity key, **and** its actual owner after writing; not simply a matching entity key.
4. **Merchant query validation before charging:** Invalid mission/service requests get HTTP 400 before reaching x402 middleware.
5. **No-spend operator preflight:** `npm run live:preflight` validates the named configuration settings, merchant/payer alignment and **unsigned** 402 quote. It never signs or pays. Credentials themselves are not printed. Failure returns a nonzero exit code.
6. **Exportable evidence:** `npm run live:evidence -- .rift-runtime/live-episodes/<runId>.json` produces a deterministic report under `.rift-runtime/evidence`. The Arena also exports the retrieved local ledger record as JSON. Reports say explicitly that **network verification is pending**.
7. **New tests:** Additional quote-drift, payment-timeout, Arkiv record match, preflight and evidence-output tests.

## Local commands (Windows PowerShell)

```powershell
npm run check                 # offline tests; no keys or network required
npm start                     # local training game on http://localhost:3000
Copy-Item .env.example .env   # edit locally; never paste keys into chat
npm run live:deps             # install optional live SDKs
npm run live:merchant         # terminal 1, starts x402 merchant
npm run live:preflight        # terminal 2, must pass before live payment
npm run live:start            # terminal 2, durable local operator server
```

For a completed real episode, use the `Retrieve last run receipt` button, then export evidence; or run:

```powershell
npm run live:evidence -- .rift-runtime/live-episodes/<actual-run-uuid>.json
```

Inspect actual 0G request ID and Storage root/tx, Hedera transaction on HashScan, and Arkiv entity plus writer wallet. Do **not** claim sponsor qualification based only on successful local tests. **0G PC** requires a real inference request ID in the core flow; **Hedera** requires an actual autonomous x402 settlement; **Arkiv** requires real writes plus a user-visible query from the testnet. Include public query and wallet addresses in the README only once verified.

## Evidence and external specifications

- ETHGlobal Mumbai sponsor rules: https://ethglobal.com/events/mumbai/prizes
- Hedera x402 exact settlement specification: https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_hedera.md
- Circle USDC on Hedera testnet asset `0.0.429274`: https://www.circle.com/multi-chain-usdc/hedera
- Arkiv query and ownership: https://docs.arkiv.network/querying/filter/
- Arkiv entity creation: https://docs.arkiv.network/writing/create/
- 0G Storage SDK: https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk

## Test boundaries

Provider mocks prove sequencing and input validation, not actual protocol interactions. The browser's restricted environment blocked direct loopback navigation, so the desktop/mobile checks loaded the **exact source modules/styles** into isolated headless Chromium pages and verified interactive behavior without real network calls. Run browser smoke testing against your real localhost and Vercel preview before submission. A raw run ledger or evidence file is not independently trusted until explorers and protocol query results corroborate it.

## Operator and human checklist

- Obtain event-provided 0G compute credits; configure the 0G model and funded Storage wallet.
- Fund and token-associate the Hedera **testnet-only** ECDSA payer wallet with USDC; fund the allowed merchant account.
- Configure an Arkiv Rabdi testnet access key and funded entity-writing wallet.
- Confirm merchant return 402 without signing, then execute **one** tightly capped authorized live run.
- Record the receipt, capture the HashScan settlement and Arkiv query screen, and save the 0G storage link/proof.
- Have a human review code, assist in testing, and document contributions and AI usage as required by ETHGlobal.
