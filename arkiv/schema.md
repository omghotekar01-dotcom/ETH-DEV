# RIFT Arkiv coordination entity schema — World 003

Proposed unique schema tag: `rift.agent-coordination.v2` on Arkiv **Rabdi** testnet, via `@arkiv-network/sdk`.

| Column | Type | Indexed | Use |
| --- | --- | --- | --- |
| `owner` | `addr` | Yes | Wallet that owns the entity |
| `mission` | `str` | Yes | Filter a particular arena mission |
| `status` | `str` | Yes | `offer`, `planned`, `paid`, `blocked`, `won` or `lost` |
| `requestId` | `str` | Yes | Verified 0G inference request ID, if present |
| `service` | `str` | Yes | Selected service / coordination offer |
| `decision` | `str` | No | Public truncated model decision summary |
| `evidence` | `str` | No | 0G Storage content root (or explicit public text) |
| `hederaTx` | `str` | No | Actual facilitator transaction ID, or literal `none` |

**Owner:** `ARKIV_PRIVATE_KEY` funded testnet account, written as `addr(account.address)`; **expiry:** 2 days. Queries filter by schema, indexed `mission`, and, when verifying own writes, by wallet owner via `.ownedBy(...)`. The user-facing live mission reads Arkiv entries **before** asking 0G to decide, so coordination data affects the planning context, and the UI can query these entities later; it isn't a write-only vanity log.

**Reproducible filter:** `readArkiv({mission:'blackout',owner:'<writer address>'})` in `server/arkiv.mjs` (which performs `.select(...).from(schema).where(eq('mission','blackout')).ownedBy(writer).fetch()`). The real writer address, entity key, and tx hash are **not yet supplied or verified**; fill those after funding and executing the testnet integration.
