# RIFT Glasshouse — UI design and implementation

Status: **experimental frontend redesign on the feature branch**, not a finalized ETHGlobal project decision.

## Product intent

A visitor should understand this in 10 seconds: **AI agents can request unsafe payments. RIFT applies explicit limits and blocks unauthorized spending.** Play the local training missions, trigger a 999-credit untrusted-merchant request, inspect the blocked decision, and replay it.

## Application architecture

- `public/engine.mjs` is the authoritative game-state reducer and spending-policy model; **do not replace it with mocked UI state**.
- `public/app.mjs` is the DOM renderer and event adapter. All navigation (`data-act`) is delegated to one real handler. Icons use self-contained inline SVG paths; no icon CDN is necessary.
- `public/style.css` contains the existing implementation-compatible rules.
- `public/ios.css` contains the Glasshouse responsive design layer. Keep it last in the stylesheet order to override old visual settings.
- `public/index.html` uses absolute same-origin `/style.css`, `/ios.css`, and `/app.mjs` asset paths so nested routing and deployment URLs cannot mistakenly resolve relative assets. An inline dark-background style provides a small progressive fallback if a CSS file is delayed.
- `server/index.mjs` serves the public files and optional protected API endpoints. Do not expose provider keys in client source.

## Visual system

A restrained **iOS/macOS-inspired web interface**, not a copy of Apple's copyrighted graphics or proprietary fonts:

- A floating, translucent desktop navigation rail with original inline icons.
- On devices at or below 760 px wide, a four-slot glass bottom bar and a functional **More** sheet for the three secondary destinations.
- A prominent hero answering the user's problem with a CSS-driven illustrated security flow, no external image dependency.
- The existing interactive 6-district tactical SVG map, preserved with current selections and a small animated agent marker only when a mission exists.
- Compact mission control with real budgets, approvals, blocked-attempt counts, policy warnings and replay feed.
- Consistent glass controls, typography, rounded corners, spacing, and agency-coded accents.
- `prefers-reduced-motion` fallback, high-contrast focus rings, and CSS fallback when `backdrop-filter` is unsupported.

## Accessibility and security

Keep real buttons and keyboard-operable district nodes. Maintain focus styles, semantic headings, status updates, explicit simulation labels and honest connectivity status. Motion must support reduced-motion preference. Every claim about real settlement requires actual network evidence.

## Local verification

Run `npm run check`. The test runner covers mission state, payment policy, API gating and UI asset routing. Manual browser QA is complementary, not a replacement for network integration tests.

Verified in a local isolated browser QA harness: viewport 1440×900 (desktop), 768×1024 (tablet), and 390×844 (mobile); no horizontal overflow; no JavaScript exceptions during tested flows; successfully launched Blackout Protocol, blocked one unauthorized simulated purchase, and opened the mobile More sheet. The local browser harness injected source content and styles directly because the browser transport in this environment blocks loopback navigation. The production/Vercel URL was **not** covered by this browser test. Test every target deployed host separately.

## Apple and open-source design research

- https://developer.apple.com/design/human-interface-guidelines
- https://github.com/cjwirth/awesome-ios-ui
- https://github.com/ivanvorobei/awesome-ios-ui
- https://github.com/topics/ios-ui?l=javascript&o=desc&s=forks
- https://github.com/topics/ios-lib
- https://github.com/topics/swift-library

These links are reference libraries only. The implementation uses no third-party Swift runtime or copied proprietary iOS design assets. Licensing and source compatibility must be checked before importing external UI code or resources.