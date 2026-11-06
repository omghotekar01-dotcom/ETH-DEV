# Arkiv use case and user-facing impact

- **Entity owner:** signer of a Rabdi testnet wallet from server environment.
- **Query dimensions:** `mission` and `status` indexed to support discovery and filtering; `decision` and `evidence` read as public payloads.
- **Lifecycle:** two-day expiration to avoid permanent accumulation of ephemeral agent testing state.
- **User-visible behavior:** Setup → Query Arkiv Network fetches actual entity records from Arkiv; local application must not quietly replace a failed query with local fake records.
- **Pending implementation evidence:** funded wallet, tx/entity key, public read-back and screenshot of the UI loading real network records.
