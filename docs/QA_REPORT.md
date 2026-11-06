# RIFT World 002 — QA Report

This report describes checks actually run against the local implementation. **It does not assert a production deployment is verified or that Web3 transactions have occurred.**

## Local automated tests

- `npm run check`: **26 tests passed**, zero failed (Node.js 22, no install required).
- JavaScript entrypoints passed Node syntax validation.
- The local HTTP server returned both `/style.css`, `/ios.css`, and the new `/arena.css` with CSS content types; `/api/health` and missing-token protections retain their behavior.

## Visual and interaction smoke tests

Chromium was run at **1440×900, 834×1112, and 390×844** using the real engine plus app script and the exact three CSS source files. The testing environment blocked headless localhost network navigation, so assets were loaded as **equivalent inline source** for the visual/browser checks; local server routes were separately tested over HTTP with Node tests. This is a limitation of the environment rather than proof of remote deployment behavior.

Verified in each viewport:

- Six districts rendered; changed selected district to **The Vault**.
- Zoom-in changed the map scale from 100% to 120%.
- Started **Blackout Protocol** from the Command deck; the budget correctly initialized to 22 credits.
- Simulated an unauthorized 999-credit payment; the event was blocked and the budget stayed at 22.
- Dismissed the security-event presentation; executed one stage, reducing the remaining balance from 22 to 20 under the existing agent discount rule.
- Expanded the tactical map using the focus control.
- No page-level JavaScript errors or document horizontal overflow.

Additional desktop flow:

- Started **Vault Breach**, reached the human checkpoint, confirmed execution is disabled until operator approval, approved the action, and resumed.
- Bought a 4-credit Risk Verification service in the sandbox, changing the remaining balance from 18 to 14.

## Defects found and corrected

- Existing `.world svg` stylesheet rules initially resized nested toolbar icons to map size. Fixed using exact CSS scoping to `#world-map` versus inline icons.
- A mobile test using force-click on an off-screen mission could activate the overlapping bottom navigation. Verified the normal accessible button click path instead. The regular browser auto-scrolling click works.
- The blocked security outcome was partially below the fold on mobile. The updated handler centers the event in the viewport after the reducer successfully blocks it.

## Outstanding limitations

- This is a research UI and deterministic training simulation. Real 0G inference, Hedera x402 settlement, and Arkiv roundtrip remain unverified.
- Verify production remote asset reachability and CSP through an independent browser before submission.
- Conduct actual human review and preserve AI-use disclosure as required by ETHGlobal.
- Game-state history is local to the browser; replay is not a blockchain proof.
- No software can be guaranteed free of all errors. This report is the scope of verified checks, not a guarantee of perfection.
