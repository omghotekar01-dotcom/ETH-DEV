# Sponsor qualification checklist — NOT YET QUALIFIED

Source: https://ethglobal.com/events/mumbai/prizes (reviewed November 5, 2026). ETHGlobal accepts up to three partner sponsor selections; this trio is a **non-finalized research strategy**.

## 0G — Build with 0G Private Computer

- [x] Application has a working user-facing sandbox interaction.
- [x] 0G router request code exists with server-kept credentials and validated plan response.
- [ ] A **real 0G inference** occurs as part of the main user experience and request ID is captured.
- [ ] Provide publicly accessible live app and sub-3-minute demo video (0G-specific requirement).
- [ ] Explain what breaks without 0G: adaptive mission advice/planning becomes unavailable, though local training remains.
- [ ] Record user testing, genuine model ID, inference evidence and integration friction.

## Hedera — Agent-to-Agent Payments via x402

- [x] A safety-bounded testnet-only x402 client CLI exists.
- [ ] At least one real x402-protected endpoint settles on Hedera testnet or mainnet (use testnet here).
- [ ] An agent/client independently discovers and completes a paid request end to end **without a human approving that specific payment** (pre-authorized policy limits are appropriate).
- [ ] Show a Hedera settlement transaction ID verified against HashScan.
- [ ] README documents setup, architecture and transaction flow with evidence.
- [ ] Integrate settlement into real mission step; CLI alone is insufficient to prove in-app behavior.

## Arkiv — Build on Arkiv (from scratch)

- [x] `@arkiv-network/sdk` typed adapter drafted (Rabdi testnet).
- [x] Wallet-owned entities, indexed mission/status and 2-day expiration designed.
- [x] UI offers a real query that only displays returned Arkiv entities.
- [ ] Install SDK and use a funded testnet account to write an entity.
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
