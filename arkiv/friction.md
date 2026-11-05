# Arkiv integration friction — evidence log

Docs studied November 5, 2026: https://docs.arkiv.network/start-here/first-entity/

- Expected: SDK creates a wallet-owned expiring entity and allows public query by schema.
- Built: Adapter and CLI conforming to documented `createEntity` and `select/from/fetch` APIs.
- Observed actual live network result: **NOT TESTED YET**; no real `entityKey`, RPC error or latency may be reported as factual.
- Potential friction to check during hands-on use: free Rabdi access key setup, faucet funding, indexer query delay, SDK type export drift, wallet public/private key handling.
- Most useful feedback *after testing*: report exact SDK version, failing call, reproducible input and actual error response; do not invent any of these.
