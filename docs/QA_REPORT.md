# RIFT Glasshouse UI verification

- Scope: self-contained local simulation UI, engine integration and static file serving.
- Test environment: Node 22.16.0, local Chromium browser through an isolated inline-resource QA harness.
- Browser widths tested: 1440, 768, 390 px; `scrollWidth` matched viewport on all three.
- Interactions tested: navigate to Missions, launch Blackout Protocol, verify active mission, simulate rogue 999-credit attempt and observe `1 BLOCKED` while no browser errors occurred. Mobile More sheet listed three secondary pages.
- Browser visible backgrounds and hero/nav layout were computed using `getComputedStyle`, confirming CSS actually applied in the QA harness.
- `npm run check` covers syntax, reducer/API tests and UI static route tests.
- Exact public preview remote CSS loading and live sponsor integrations are **not yet externally verified**. Build status alone does not establish external functionality.
- Do not confuse any simulated balance with real HBAR/USDC. This is a **training sandbox**.

Follow-up for human testers: open the deployed URL, inspect `/ios.css` response as `200 text/css`, test keyboard focus and navigation, test all four mission outcomes, review mobile devices with actual touch input, and validate each sponsor flow with testnet evidence.