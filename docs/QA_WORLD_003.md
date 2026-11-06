# World 003 QA / completion record

**Verified locally**: Node.js 22.16, JavaScript syntax, base game tests, injected integration tests for all three sponsor actions, safe-stop and idempotency controls. Actual testnet settlement and SDK download are **not verified here** because network access and funded credentials are unavailable in this execution environment.

The local arena remains playable with no npm install. The 0G inference is a genuinely network-backed optional mode; the new server orchestration requires Arkiv read -> 0G decision -> 0G Storage upload -> conditional Hedera x402 paid API call -> Arkiv write/queryback. Every provider result is validated before it is labeled successful. Browser and API tests must be executed again after configuring real credentials.

Required live evidence: 0G PC request ID and Storage Merkle root+tx, Hedera tx ID verified on HashScan, Arkiv entity key and wallet address with a real filtered query. 0G models may decide NOT to purchase, in which case the run does not meet Hedera's paid request requirement. Live testnet credentials and genuine human use are still required to qualify for prizes.

**No guarantee of prizes or zero bugs.** Full production release requires security review, a truly durable multi-user payment ledger, monitoring, and live end-to-end verification.
