# Testing and demo acceptance

## Automated

Run `npm run check`. This performs three Node syntax checks and runs the built-in test suite. Tests cover starting, winning, budgets, duplicate purchases, approvals/denials, pause/abort, malicious attempts, provider validation, model output allowlist and HTTP route behavior. Mocked provider tests do NOT count as a live sponsor integration.

## Human acceptance script

1. Open `http://localhost:3000` in desktop and mobile browsers. Check layout, each navigation route and keyboard focus.
2. Launch Blackout. Record the starting credit balance. Click Rogue Agent once or repeatedly: each attempt must increase blocked attempts but **must never decrease credits**.
3. Buy the same service twice in the same stage: only the first purchase charges fictional credits.
4. Step through all three Blackout tasks and verify status becomes WON. Restart a mission and verify local score accumulation.
5. Select Vault Breach: after first action, a second step must pause at a visible approval checkpoint. Deny should terminate without executing the protected action. Restart and approve to proceed.
6. Toggle Auto and Pause; confirm pause freezes progress.
7. Export replay JSON; inspect that it says `mode: sandbox` and does not contain real transaction receipts.
8. Open Setup: without environment keys, provider statuses must read unavailable/offline; no fake records should appear.
9. If `OG_API_KEY`, `OG_MODEL` and `RIFT_ACCESS_TOKEN` are provisioned, run actual inference and record a non-empty response ID from 0G. Never display hardcoded fixture IDs as real.
10. If funded Arkiv Rabdi keys exist, run publish CLI, confirm entity key and read-back, then query from the UI.
11. If Hedera x402 testnet endpoint and funded wallet exist, run the CLI and independently validate its transaction on HashScan. Do not claim Hedera integration achieved if no real transaction settles.

## Known environment constraints

External provider tests cannot pass without real credentials, testnet funds, SDK installation and reachable networks. Do not substitute mocked responses for proof. Browser UI has not been certified on all devices.
