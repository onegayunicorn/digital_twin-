# Webhook and Trigger Security Contract

Webhook requests must be authenticated with an HMAC signature over `timestamp.rawBody`, and the timestamp must be within five minutes of the receiver clock. The receiver must parse JSON only after signature verification, derive an event identifier, and record that identifier in durable storage before processing. Repeated event identifiers return a successful duplicate response and do not execute the action again.

The default trigger mode is `dry_run`. The allowlist currently contains `record_event`, `request_review`, and `refresh_preview`. No action can initiate trading, wallet transfer, NFT minting, blockchain writes, or other financial activity. Live mode requires an explicit environment setting, a provider-specific adapter, and a separate operational review.

Required production secrets are `IDENTITY_FORGE_WEBHOOK_SECRET`, `CLOUDFLARE_API_TOKEN`, and `CLOUDFLARE_ACCOUNT_ID`. Secrets must be configured in the hosting provider’s secret store and must never be committed to Git, placed in frontend environment variables, or pasted into issue comments.

Cloudflare’s build settings remain Root `/`, Build `pnpm build`, Deploy `pnpm exec wrangler deploy`, Node `24.18.0`, and pnpm `10.11.1`. The repository preflight must pass before deployment. For a React SPA, `wrangler.jsonc` must use Workers Static Assets with `not_found_handling` set to `single-page-application`.
