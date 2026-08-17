# Identity Forge Module Catalog

The repository separates production frontend code, local simulation modules, and external-integration boundaries. The conceptual Hyperfusion Wealth Bridge modules are intentionally isolated from live financial, wallet, NFT, or blockchain operations.

| Module family | Location | Runtime boundary |
| --- | --- | --- |
| Avatar and appearance domain | `web-app/client/src/lib/` | Browser-only character state |
| GLTF / React Three Fiber viewport | `web-app/client/src/components/canvas/` | Browser WebGL; lazy-loaded |
| Webhook security | `integrations/webhooks/` | Signed, replay-protected, dry-run by default |
| Conceptual simulation | `identity-forge-v2-pdf/packages/conceptual_simulation/` | Local deterministic Python models |
| Wealth Bridge compatibility layer | `identity-forge-v2-pdf/packages/wealth_bridge_simulation/` | Local paper simulation only |
| Cloudflare deployment | `scripts/identity-forge-v2/`, `scripts/cloudflare/`, `wrangler.jsonc` | Build, artifact gate, and gated publish |
| Multi-worker templates | `infra/cloudflare/workers/` | Standalone Worker configuration templates |
| Pipeline contracts | `pipelines/cloudflare/`, `ci/github-workflows/` | Reviewable CI definitions; not automatically active |

## Activation boundary

The repository provides `pnpm cloudflare:activate` as a safe dry instruction path. Live deployment requires the Cloudflare dashboard Build command to be `pnpm build:verified`, the Deploy command to be `pnpm deploy:raw`, and an explicit `CLOUDFLARE_ACTIVATE_CONFIRM=YES` environment variable when invoking `pnpm cloudflare:activate --live`. No external financial or transactional action is enabled by this activation path.
