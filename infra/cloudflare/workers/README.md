# Multi-Worker Cloudflare Templates

This directory contains explicit configuration templates for the three worker names described in the supplied deployment report. The templates are **not proof that those workers are currently live**; they are source-controlled deployment contracts that must be dry-run and deployed from their respective application roots.

| Worker | Configuration | Asset directory | Reported URL |
| --- | --- | --- | --- |
| Genesis Cure Foundation | `genesis-cure-foundation/wrangler.jsonc` | `./dist` | `https://genesis-cure-foundation.onegayunicorn.workers.dev` |
| Alchemical | `alchemical/wrangler.jsonc` | `./dist` | `https://alchemical.onegayunicorn.workers.dev` |
| KCD2-AI | `kcd2-ai/wrangler.jsonc` | `./dist` | `https://kcd2-ai.onegayunicorn.workers.dev` |

The repository’s authoritative production app remains configured by the root `wrangler.jsonc` and deploys `web-app/dist/public`. These templates use `./dist` because the supplied report describes standalone worker applications with that output directory. Do not point them at the main app’s output unless the application package is intentionally changed.

Use `scripts/cloudflare/verify-workers.mjs` for read-only HTTP checks. A successful HTTP response is not a security assessment or evidence that the reported version is deployed.
