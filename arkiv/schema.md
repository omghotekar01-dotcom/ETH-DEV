# RIFT Arkiv entity schema

Proposed schema tag: `rift.agent-missions.v1`. Each entity represents a public, short-lived mission outcome or policy event (not secret mission prompts).

| Field | Type | Indexed | Meaning |
|---|---|---|---|
| `owner` | addr | Yes | Wallet address allowed to own/change entity |
| `mission` | str | Yes | One of `blackout`, `supply`, `vault`, `genesis` |
| `status` | str | Yes | `won`, `lost`, `blocked` |
| `decision` | str | No | Short public decision summary |
| `evidence` | str | No | Short public provenance note; cannot claim proof unless verified |

**Owner:** account derived from `ARKIV_PRIVATE_KEY` on the Rabdi testnet. **Expiration:** 2 days using `ExpirationTime.fromDays(2)`. **Queries:** `select({$key:true,mission:true,status:true,decision:true,evidence:true}).from(schema).fetch()` from `server/arkiv.mjs`. SDK can also filter on indexed `mission`/`status` when developed further. Do not post private information.

**Write command:** `node scripts/arkiv-publish.mjs blackout blocked "Reason" "Public note"`. **Read feature:** `/api/arkiv/feed` and UI Setup → Query Arkiv Network. Real entity key and real wallet address are pending funded testnet execution.
