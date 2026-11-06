# Why Arkiv instead of PostgreSQL?

Arkiv permits querying public mission records associated with an owner wallet and explicit expiry without trusting RIFT's own server/database as the sole custodian. A separate agent client could discover recent allowed or blocked mission outcomes from the Rabdi schema without receiving RIFT app credentials.

**Trade-off:** Arkiv public data is unsuitable for private prompts, private keys or confidential security decisions. Those remain on the browser/secure backend. If Arkiv were replaced by Postgres, local gameplay would still work but portable wallet-owned public entities and native expiry semantics would be lost.

**Proof required:** A real funded Rabdi write and an independently successful read by the user-facing UI. No such proof is claimed yet.
