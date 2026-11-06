# Sponsor qualification checklist — IMPLEMENTATION READY TO TEST — NOT YET QUALIFIED

Source: https://ethglobal.com/events/mumbai/prizes (reviewed November 5, 2026). ETHGlobal accepts up to three partner sponsor selections; this trio is a **non-finalized research strategy**.

## 0G — Build with 0G Private Computer

- [x] Application has a working user-facing sandbox interaction.
- [x] 0G Router code validates the actual model decision in the mission loop, with server-only credentials and request IDs.
- [x] A separate 0G Storage SDK adapter now archives each real decision with the request ID and requires a Merkle root and transaction hash before any payment.
- [x] Network outages fail closed; no fake model or storage fallback.
- [ ] A **real 0G inference** occurs as part of the main user experience and request ID is captured.
- [ ] Provide publicly accessible live app and sub-3-minute demo video (0G-specific requirement).
- [ ] Explain what breaks without 0G: adaptive mission advice/planning becomes unavailable, though local training remains.
- [ ] Record user testing, genuine model ID, inference evidence and integration friction.

## Hedera — Agent-to-Agent Payments via x402

- [x] A bounded testnet-only x402 client, guarded in-app orchestrator and x402-protected merchant endpoint now exist.
- [x] Pre-signed spending policy, merchant/asset/network allowlists, durable single-process run ledger, and no automatic paid retry.
- [x] Autonomous client pays without an individual payment approval when 0G chooses an allowed purchase.
- [ ] At least one real x402-protected endpoint settles on Hedera testnet or mainnet (use testnet here).
- [ ] An agent/client independently discovers and completes a paid request end to end **without a human approving that specific payment** (pre-authorized policy limits are appropriate).
- [ ] Show a Hedera settlement transaction ID verified against HashScan.
- [ ] README documents setup, architecture and transaction flow with evidence.
- [x] In-app orchestration now exists for actual live model-selected purchase (not automatically re-run on unknown settlement).
- [ ] Complete real in-app end-to-end payment and verify the true transaction reference and HashScan link.

## Arkiv — Build on Arkiv (from scratch)

- [x] `@arkiv-network/sdk` typed Rabdi adapter with `rift.agent-coordination.v2` schema, query-by-mission and write/read-back.
- [x] Arkiv query results are passed as untrusted coordination context to the real 0G planner; Arkiv influences the decision rather than being only a decorative log.
- [x] Wallet-owned entities with indexed mission/status/requestId/service and two-day expiration implemented.
- [x] UI offers a real query that only displays returned Arkiv entities.
- [ ] Install SDKs and use funded testnet accounts to write a real entity and complete a real decision.
- [ ] Query it back from Arkiv and show result in the actual UI.
- [ ] README includes real writer wallet address and a reproducible query.
- [x] Arkiv criterion docs present; empirical feedback/usage evidence remain pending.
- [ ] Test and document genuine user reach and friction, not fabricated metrics.

## ETHGlobal general

- [ ] Confirm official selected track (Classic vs Continuity) and eligibility.
- [x] Separate branch and incremental development plan.
- [ ] Team makes meaningful human contributions and logs them.
- [ ] AI assistance disclosed accurately.
- [ ] Sponsor-specific documentation and real test evidence attached.
- [ ] Actual public deployed URL independently verified.
- [ ] Record human-narrated and human-produced demo in required format.
- [ ] Submit on Hacker Dashboard before November 7, 2026 at 09:00 IST.

## New World 003 validation (not sponsor receipts)

- [x] 40 local tests including mocked three-provider pipeline, zero-payment safe-stop, idempotency, and game-state separation.
- [x] Styled Chromium QA with intercepted local exact sources at desktop and mobile width; real site/API paths served correctly by Node.
- [ ] Actual 0G API/Storage, Hedera facilitator and Arkiv Rabdi calls executed with sponsor-funded keys.
- [ ] Confirm SDK package versions in the final installation and retain a reviewed lockfile before production deployment.
- [ ] Run a full sponsor-qualified session on an operator-controlled durable host and record its authentic evidence.
