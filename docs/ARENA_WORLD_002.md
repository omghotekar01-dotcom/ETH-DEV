# RIFT World 002 — Interactive Arena Upgrade

**Status:** Research candidate; not a finalized ETHGlobal project choice. This update affects the UI only. All in-game amounts are fictional **sandbox credits**, not actual currency.

## Problem, in one sentence

An autonomous AI agent may request a payment outside its permissions. RIFT makes that request, the policy decision, and human control visible in a playable local arena.

## What changed

- Replaced the previous flat isometric scene with an original, six-district SVG mini-city rendered directly in `public/app.mjs`. The districts are differentiated by purpose: Signal Spire / antenna, Data Bazaar / market cluster, The Forge / machinery, The Vault / secured chamber, Research Lab / telescope, Transit Port / crane.
- Preserved actual district IDs, mission stage positions, and all engine action names. The visual scene is not a separate mock game.
- Added a usable camera HUD: zoom in, zoom out, reset, and expanded focus. Selected-district panels and the district dock use the existing `SELECT_ZONE` action.
- Rebuilt the idle Command deck around four *directly launchable* missions. During a mission, the deck shows stage progression, remaining budget, round count, score, operator controls, protected checkpoints, the spending firewall, optional real-0G adviser status, and the local event feed.
- Replaced the large intro banner with a compact brief and factual spending-policy summary.
- Added a prominent **Payment blocked** sequence when the existing `ATTACK` reducer denies the 999-credit unauthorized merchant request. It appears only after the reducer confirms `blockedAttempts` increased and the budget stayed unchanged.
- Added responsive styles in `public/arena.css`, loaded **after** `style.css` and `ios.css`. The styles specifically scope the map SVG so the legacy `.world svg` selector cannot accidentally enlarge toolbar icons.

## What did not change

- `public/engine.mjs` remains the single source of truth for missions, agents, services, budgets, rules, replay, and protected actions.
- Node server and Vercel API routes remain unchanged.
- Sponsor SDK status is not represented as a confirmed live integration. AI requests, chain transactions, and Arkiv writes are not simulated as successful network calls.
- No npm dependencies, font files, image CDNs, WebGL engine, or proprietary UI libraries were added.
- No work was merged into `main`.

## Key files

| File | Role |
|---|---|
| `public/app.mjs` | World geometry, mission inspector, actual UI actions and security-event visual |
| `public/arena.css` | Responsive scene, Command deck, interaction states, focus mode |
| `public/index.html` | Same-origin stylesheet load order |
| `tests/ui.test.mjs` | Entry, semantics, CSS availability and core UI wiring |
| `docs/QA_REPORT.md` | Exact test coverage, findings and remaining constraints |

## Developer handoff

Start with `npm run check`, then `npm start` and open `http://localhost:3000`. On mobile, the four-item bottom tab bar remains active. All existing endpoints and mission state are preserved. Do not remove the explicit **TRAINING SANDBOX / No live payments** indicators unless real network execution has been implemented and audited.

### Safe extension path

1. Improve visual geometry using original SVG primitives in `tower()` and `prism()` rather than adding unrelated 3D packages.
2. Preserve the `ZONES` array as the authoritative map coordinate source; changing its IDs requires verifying mission step IDs.
3. Re-run the `ATTACK`/approval/buy/double-charge tests after changing any action or display.
4. Only use real Hedera/0G/Arkiv evidence after independently verifying the network result and recording a genuine receipt or request ID.

## Accessibility

Districts are keyboard-selectable (`Enter`/`Space`), the dock uses native buttons, map controls have labels, and the blocked-event view has `role=status` plus assertive live text. Reduced-motion preferences turn off the scene's ambient animations. The same game logic works in narrow layouts without sideways document scrolling.
