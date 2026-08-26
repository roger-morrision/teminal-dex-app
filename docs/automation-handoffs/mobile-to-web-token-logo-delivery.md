# MOBILE → WEB handoff: reliable token-logo delivery

Status: external CDN transport blocks logos in MOBILE Discover

Observed behavior:

- Discovery rows contain HTTPS URLs under `cdn.dexscreener.com/cms/images/...`.
- Android attempts to render them and then falls back to token initials.
- Emulator runtime evidence reports `SSL_connect ... Connection refused` for the external image connection.
- MOBILE keeps cleartext disabled and must not weaken TLS or trust arbitrary certificates to display artwork.

Requested WEB enhancement:

- Fetch, validate, resize, and cache provider token artwork server-side.
- Return a trusted same-origin HTTPS `imageUrl` (or a versioned explicit `imageProxyUrl`) in discovery, search, whale, and token-detail contracts.
- Allow only known provider image hosts, enforce image MIME type and byte/pixel limits, strip metadata, reject redirects to private/local addresses, and emit a bounded PNG/WebP representation.
- Cache both successful artwork and negative lookups so list rendering does not fan out to provider CDNs.
- Preserve `null` when no validated artwork exists; never substitute unrelated project artwork.

Acceptance:

- A production Android client can load at least 95% of non-null returned logo URLs without contacting a third-party host directly.
- The same token identity resolves to the same cached logo URL across discovery and detail responses.
- Invalid, oversized, non-image, redirecting, and private-network sources fail closed to `null`.
- Contract and integration tests cover cache hits, provider failure, MIME validation, redirect safety, and negative caching.
